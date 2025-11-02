import os
import requests
from flask import Flask, render_template, request
import openai

app = Flask(__name__)

# --- API keys ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CARBON_API_KEY = os.getenv("CARBON_API_KEY")

# --- OpenAI setup ---
openai.api_key = OPENAI_API_KEY
client = openai

# --- Mapping for local defaults (fallback if API fails) ---
carbon_fallback = {
    'meat_dairy': {"less_20": 1800, "20_50": 2400, "50_100": 3200, "over_100": 4000},
    'transport': {"car_petrol": 2500, "car_electric": 800, "public": 800, "walk_cycle": 200, "home": 300},
    'flights': {"none": 0, "short": 500, "long": 2000, "3plus": 3500},
    'home_energy_source': {"renewable": 500, "mixed": 1200, "gas_oil": 2200, "unsure": 1500},
    'home_efficiency': {"very": 0.7, "some": 0.9, "not_very": 1.2, "not_sure": 1.0},
    'recycling': {"always": 0.85, "often": 0.9, "sometimes": 0.95, "rarely": 1.0},
    'sustainable_shopping': {"most": 0.9, "occasionally": 0.95, "rarely": 1.0},
    'device_usage': {"less_2": 300, "2_5": 600, "5_8": 1000, "8plus": 1500},
    'food_waste': {"almost_none": 100, "a_little": 300, "some": 600, "a_lot": 1000}
}

# --- Routes ---
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/quiz')
def quiz():
    return render_template('quiz.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        # --- Get form data ---
        form_fields = [
            'meat_dairy', 'transport', 'flights', 'home_energy_source',
            'home_efficiency', 'recycling', 'sustainable_shopping',
            'carbon_awareness', 'device_usage', 'food_waste'
        ]
        form_data = {field: request.form.get(field) for field in form_fields}

        missing_fields = [k for k, v in form_data.items() if not v]
        if missing_fields:
            return f"<h2>Missing fields: {', '.join(missing_fields)}</h2><a href='/quiz'>← Back to Quiz</a>", 400

        total_carbon_kg = 0

        # --- Use Carbon API if key is present ---
        if CARBON_API_KEY:
            try:
                # Example: a hypothetical Carbon API call
                response = requests.post(
                    "https://api.carbonapi.com/calculate",
                    headers={"Authorization": f"Bearer {CARBON_API_KEY}"},
                    json=form_data,
                    timeout=5
                )
                data = response.json()
                total_carbon_kg = round(data.get("total_kgCO2", 0), 1)
            except Exception as e:
                print(f"Carbon API error: {e}")
                total_carbon_kg = fallback_carbon(form_data)
        else:
            total_carbon_kg = fallback_carbon(form_data)

        # --- Build lifestyle summary ---
        lifestyle_summary = build_lifestyle_summary(form_data)

        # --- Generate AI story if OpenAI key present ---
        story, tips = generate_ai_story(lifestyle_summary)

        return render_template('results.html', carbon_kg=total_carbon_kg, story=story, tips=tips)

    except Exception as e:
        print(f"Error in calculate route: {e}")
        return f"""
        <h2>Oops! Something went wrong.</h2>
        <p>Error: {str(e)}</p>
        <p>Please try again or contact support if the problem persists.</p>
        <a href='/quiz'>← Back to Quiz</a>
        """, 500


# --- Helper functions ---
def fallback_carbon(form_data):
    total = 0
    total += carbon_fallback['meat_dairy'].get(form_data['meat_dairy'], 3000)
    total += carbon_fallback['transport'].get(form_data['transport'], 1000)
    total += carbon_fallback['flights'].get(form_data['flights'], 0)
    base_home = carbon_fallback['home_energy_source'].get(form_data['home_energy_source'], 1500)
    efficiency_factor = carbon_fallback['home_efficiency'].get(form_data['home_efficiency'], 1.0)
    total += base_home * efficiency_factor
    total *= carbon_fallback['recycling'].get(form_data['recycling'], 1.0)
    total *= carbon_fallback['sustainable_shopping'].get(form_data['sustainable_shopping'], 1.0)
    device_kwh = carbon_fallback['device_usage'].get(form_data['device_usage'], 800)
    total += device_kwh * 0.233
    total += carbon_fallback['food_waste'].get(form_data['food_waste'], 500)
    return round(total, 1)


def build_lifestyle_summary(form_data):
    summary = []
    if form_data['meat_dairy'] == "less_20":
        summary.append("follows a mostly plant-based diet")
    elif form_data['meat_dairy'] == "over_100":
        summary.append("consumes large amounts of meat and dairy")
    if form_data['transport'] == "walk_cycle":
        summary.append("walks or cycles daily")
    elif form_data['transport'] == "car_petrol":
        summary.append("relies heavily on petrol cars")
    elif form_data['transport'] == "public":
        summary.append("uses public transport regularly")
    if form_data['flights'] == "3plus":
        summary.append("flies frequently for travel")
    elif form_data['flights'] == "none":
        summary.append("never flies")
    if form_data['home_energy_source'] == "renewable":
        summary.append("powers their home with renewable energy")
    elif form_data['home_energy_source'] == "gas_oil":
        summary.append("heats their home with fossil fuels")
    if form_data['food_waste'] == "a_lot":
        summary.append("wastes significant amounts of food")
    elif form_data['food_waste'] == "almost_none":
        summary.append("minimizes food waste")
    if form_data['recycling'] == "always":
        summary.append("recycles diligently")
    elif form_data['recycling'] == "rarely":
        summary.append("rarely recycles")
    if form_data['sustainable_shopping'] == "most":
        summary.append("buys second-hand and sustainable goods")
    return "; ".join(summary) if summary else "lives an average modern lifestyle"


def generate_ai_story(summary):
    if not OPENAI_API_KEY:
        # fallback story
        story = f"In 2050, the world shaped by lifestyles like yours presents a mixed picture. {summary}."
        tips = [
            "Transition to renewable energy sources for home and transport",
            "Support local, sustainable food systems and reduce waste"
        ]
    else:
        prompt = f"""
        You are a climate storyteller in 2050. This person {summary}.
        Describe the world in 2050 (120–150 words). Include climate, cities, nature, wildlife, daily life.
        End with 2 actionable bullet points for sustainability today.
        """
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.8
            )
            story_full = chat_completion.choices[0].message.content.strip()
            # split tips
            if "•" in story_full:
                parts = story_full.split("•")
                story = parts[0].strip()
                tips = ["•" + p.strip() for p in parts[1:]]
            else:
                story = story_full
                tips = []
        except Exception as e:
            print(f"OpenAI API error: {e}")
            story = "Unable to generate story at this time."
            tips = []

    return story, tips


@app.route('/test')
def test():
    return "Flask app is working!"


if __name__ == '__main__':
    app.run(debug=True)
