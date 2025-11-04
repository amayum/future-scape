import os
import requests
from flask import Flask, render_template, request
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- API keys ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CARBON_API_KEY = os.getenv("CARBON_API_KEY")

# Only setup OpenAI client if API key exists
client = None
if OPENAI_API_KEY:
    try:
        import openai
        openai.api_key = OPENAI_API_KEY
        client = openai
        print("OpenAI client initialized successfully")
    except Exception as e:
        print(f"OpenAI setup failed: {e}")
        client = None
else:
    print("No OpenAI API key found - using fallback stories")

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

        total_carbon_kg = fallback_carbon(form_data)

        # --- Build lifestyle summary ---
        lifestyle_summary = build_lifestyle_summary(form_data)

        # --- Generate AI story about the world in 2050 ---
        story, tips = generate_2050_story(lifestyle_summary, total_carbon_kg)

        return render_template('results.html', carbon_kg=total_carbon_kg, story=story, tips=tips)

    except Exception as e:
        print(f"Error in calculate route: {e}")
        return f"""
        <div class="error-message">
            <h2>Oops! Something went wrong.</h2>
            <p>Error: {str(e)}</p>
            <p>Please try again or contact support if the problem persists.</p>
            <a href='/quiz'>← Back to Quiz</a>
        </div>
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
    
    # Diet
    if form_data['meat_dairy'] == "less_20":
        summary.append("mostly plant-based diet")
    elif form_data['meat_dairy'] == "over_100":
        summary.append("high meat and dairy consumption")
    else:
        summary.append("moderate diet")
    
    # Transport
    if form_data['transport'] == "walk_cycle":
        summary.append("active transportation (walking/cycling)")
    elif form_data['transport'] == "car_petrol":
        summary.append("petrol car usage")
    elif form_data['transport'] == "public":
        summary.append("public transport usage")
    
    # Flights
    if form_data['flights'] == "3plus":
        summary.append("frequent flying")
    elif form_data['flights'] == "none":
        summary.append("no flying")
    
    # Home energy
    if form_data['home_energy_source'] == "renewable":
        summary.append("renewable home energy")
    elif form_data['home_energy_source'] == "gas_oil":
        summary.append("fossil fuel home energy")
    
    # Food waste
    if form_data['food_waste'] == "a_lot":
        summary.append("high food waste")
    elif form_data['food_waste'] == "almost_none":
        summary.append("minimal food waste")
    
    # Recycling
    if form_data['recycling'] == "always":
        summary.append("consistent recycling")
    elif form_data['recycling'] == "rarely":
        summary.append("infrequent recycling")
    
    return ", ".join(summary)

def generate_2050_story(lifestyle_summary, carbon_kg):
    # Try to use OpenAI if available
    if client and OPENAI_API_KEY:
        try:
            prompt = f"""
            Imagine the world in 2050 if everyone lived with this lifestyle: {lifestyle_summary}.
            The annual carbon footprint is {carbon_kg} kg CO2 per person. 
            
            Write a vivid 150-word description of what the world looks like in 2050 under these conditions.
            Consider:
            - Climate and environment
            - Cities and infrastructure  
            - Daily life and society
            - Technology and energy
            - Nature and wildlife
            
            Then provide 2 specific, actionable tips to improve sustainability.
            
            Make it engaging and thought-provoking, showing both challenges and opportunities.
            """
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a visionary climate storyteller creating realistic but hopeful visions of the future."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.8
            )
            
            story_full = response.choices[0].message.content.strip()
            
            # Split into story and tips
            lines = story_full.split('\n')
            story_lines = []
            tips = []
            
            for line in lines:
                if line.strip().startswith('-') or line.strip().startswith('•') or any(word in line.lower() for word in ['tip', 'suggestion', 'action']):
                    tips.append(line.strip())
                else:
                    story_lines.append(line.strip())
            
            story = ' '.join(story_lines)
            
            if not tips:
                tips = [
                    "• Consider reducing meat consumption and food waste",
                    "• Explore renewable energy and public transport options"
                ]
                
            return story, tips
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fall through to fallback stories
    
    # Fallback stories based on carbon footprint
    if carbon_kg < 2000:
        story = f"""In 2050, the world is a vibrant, sustainable paradise. Because everyone adopted lifestyles like yours ({lifestyle_summary}), cities have transformed into green havens. Vertical farms provide local food, renewable energy powers everything, and clean air is the norm. Wildlife thrives in urban parks and restored natural areas. People enjoy healthier lives with clean transportation and strong communities. Your sustainable choices created a future where humanity lives in harmony with nature."""
        
        tips = [
            "• Continue your sustainable habits and inspire others",
            "• Support community renewable energy projects"
        ]
        
    elif carbon_kg < 4000:
        story = f"""In 2050, the world shows both progress and challenges. With widespread adoption of lifestyles like yours ({lifestyle_summary}), some regions thrive while others struggle. Renewable energy has expanded, but climate impacts still affect vulnerable areas. Cities have better public transport and green spaces, but occasional extreme weather reminds us of the work ahead. Your moderate footprint contributes to gradual positive change, showing that every action matters in building a sustainable future."""
        
        tips = [
            "• Reduce meat consumption and food waste further",
            "• Switch to electric vehicles or public transport when possible"
        ]
        
    else:
        story = f"""In 2050, climate change has significantly reshaped our world. With many people living like you ({lifestyle_summary}), rising temperatures and extreme weather are common. Coastal cities face flooding, agriculture struggles with changing seasons, and biodiversity loss continues. However, innovation thrives as communities adapt with green technology and sustainable practices. Your awareness of this future is the first step toward creating positive change and building resilience for tomorrow."""
        
        tips = [
            "• Shift toward plant-based meals and reduce flights",
            "• Invest in home energy efficiency and support climate policies"
        ]
    
    return story, tips

@app.route('/test')
def test():
    return "Flask app is working!"

if __name__ == '__main__':
    app.run(debug=True)