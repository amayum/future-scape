// --- Quiz Questions Data ---
const questions = [
  {
    id: "meat_dairy",
    text: "1. How much do you spend on meat and dairy products per week (£)?",
    options: [
      { text: "Less than £20", value: "less_20" },
      { text: "£20–50", value: "20_50" },
      { text: "£50–100", value: "50_100" },
      { text: "Over £100", value: "over_100" }
    ]
  },
  {
    id: "transport",
    text: "2. What is your main mode of daily transport?",
    options: [
      { text: "Car (petrol/diesel)", value: "car_petrol" },
      { text: "Car (electric/hybrid)", value: "car_electric" },
      { text: "Public transport", value: "public" },
      { text: "Walking or cycling", value: "walk_cycle" },
      { text: "Work/study from home", value: "home" }
    ]
  },
  {
    id: "flights",
    text: "3. How many flights do you take per year (return trips)?",
    options: [
      { text: "None", value: "none" },
      { text: "1–2 short flights", value: "short" },
      { text: "1–2 long flights", value: "long" },
      { text: "3+ flights", value: "3plus" }
    ]
  },
  {
    id: "home_energy_source",
    text: "4. How is your home mainly powered or heated?",
    options: [
      { text: "Electricity from renewable sources", value: "renewable" },
      { text: "Electricity from mixed grid", value: "mixed" },
      { text: "Gas or oil heating", value: "gas_oil" },
      { text: "Unsure", value: "unsure" }
    ]
  },
  {
    id: "home_efficiency",
    text: "5. How energy efficient is your home?",
    options: [
      { text: "Very efficient", value: "very" },
      { text: "Some improvements made", value: "some" },
      { text: "Not very efficient", value: "not_very" },
      { text: "Not sure", value: "not_sure" }
    ]
  },
  {
    id: "recycling",
    text: "6. How often do you recycle household waste (plastic, paper, glass, etc.)?",
    options: [
      { text: "Always", value: "always" },
      { text: "Often", value: "often" },
      { text: "Sometimes", value: "sometimes" },
      { text: "Rarely", value: "rarely" }
    ]
  },
  {
    id: "sustainable_shopping",
    text: "7. Do you regularly buy second-hand, repaired, or sustainably sourced products?",
    options: [
      { text: "Yes, most of the time", value: "most" },
      { text: "Occasionally", value: "occasionally" },
      { text: "Rarely", value: "rarely" },
      { text: "Never", value: "never" }
    ]
  },
  {
    id: "carbon_awareness",
    text: "8. How much do you think about your carbon footprint when making purchases or travel decisions?",
    options: [
      { text: "Always", value: "high" },
      { text: "Sometimes", value: "medium" },
      { text: "Rarely", value: "low" },
      { text: "Never", value: "none" }
    ]
  },
  {
    id: "device_usage",
    text: "9. Roughly how many hours per day do you use electronic devices (phone, laptop, TV, etc.)?",
    options: [
      { text: "Less than 2 hours", value: "less_2" },
      { text: "2–5 hours", value: "2_5" },
      { text: "5–8 hours", value: "5_8" },
      { text: "8+ hours", value: "8plus" }
    ]
  },
  {
    id: "food_waste",
    text: "10. How much food ends up being thrown away each week?",
    options: [
      { text: "Almost none (less than 1 meal)", value: "almost_none" },
      { text: "A little (1-2 meals)", value: "a_little" },
      { text: "Some (3-5 meals)", value: "some" },
      { text: "A lot (more than 5 meals)", value: "a_lot" }
    ]
  }
];

// --- DOM References ---
const quizContainer = document.getElementById("quiz-container");
const quizForm = document.getElementById("quiz-form");

// --- Render Quiz ---
function renderQuiz() {
  questions.forEach(q => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question-block");

    const questionText = document.createElement("p");
    questionText.textContent = q.text;
    questionDiv.appendChild(questionText);

    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.classList.add("option");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = q.id;
      input.value = opt.value;
      input.required = true;

      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + opt.text));

      questionDiv.appendChild(label);
    });

    quizContainer.appendChild(questionDiv);
  });
}

// --- Form Submit ---
quizForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(quizForm);
  const data = Object.fromEntries(formData.entries());

  fetch("/calculate", {
    method: "POST",
    body: new URLSearchParams(data)
  })
    .then(res => res.text())
    .then(html => {
      document.body.innerHTML = html; // render results page
    })
    .catch(err => alert("Error submitting quiz: " + err));
});

// --- Initialize ---
renderQuiz();
