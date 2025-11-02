// quiz.js

// --- Quiz questions and options ---
const quizData = [
  {
    id: "meat_dairy",
    question: "How much do you spend on meat and dairy products per week (£)?",
    options: [
      { text: "Less than £20", value: "less_20" },
      { text: "£20–50", value: "20_50" },
      { text: "£50–100", value: "50_100" },
      { text: "Over £100", value: "over_100" },
    ],
  },
  {
    id: "transport",
    question: "What is your main mode of daily transport?",
    options: [
      { text: "Car (petrol/diesel)", value: "car_petrol" },
      { text: "Car (electric/hybrid)", value: "car_electric" },
      { text: "Public transport", value: "public" },
      { text: "Walking or cycling", value: "walk_cycle" },
      { text: "Work/study from home", value: "home" },
    ],
  },
  {
    id: "flights",
    question: "How many flights do you take per year (return trips)?",
    options: [
      { text: "None", value: "none" },
      { text: "1–2 short flights", value: "short" },
      { text: "1–2 long flights", value: "long" },
      { text: "3+ flights", value: "3plus" },
    ],
  },
  {
    id: "home_energy_source",
    question: "How is your home mainly powered or heated?",
    options: [
      { text: "Electricity from renewable sources", value: "renewable" },
      { text: "Electricity from mixed grid", value: "mixed" },
      { text: "Gas or oil heating", value: "gas_oil" },
      { text: "Unsure", value: "unsure" },
    ],
  },
  {
    id: "home_efficiency",
    question: "How energy efficient is your home? (e.g., insulation, LED lights, smart thermostat)",
    options: [
      { text: "Very efficient", value: "very" },
      { text: "Some improvements made", value: "some" },
      { text: "Not very efficient", value: "not_very" },
      { text: "Not sure", value: "not_sure" },
    ],
  },
  {
    id: "recycling",
    question: "How often do you recycle household waste (plastic, paper, glass, etc.)?",
    options: [
      { text: "Always", value: "always" },
      { text: "Often", value: "often" },
      { text: "Sometimes", value: "sometimes" },
      { text: "Rarely", value: "rarely" },
    ],
  },
  {
    id: "sustainable_shopping",
    question: "Do you regularly buy second-hand, repaired, or sustainably sourced products?",
    options: [
      { text: "Yes, most of the time", value: "most" },
      { text: "Occasionally", value: "occasionally" },
      { text: "Rarely", value: "rarely" },
      { text: "Never", value: "never" },
    ],
  },
  {
    id: "carbon_awareness",
    question: "How much do you think about your carbon footprint when making purchases or travel decisions?",
    options: [
      { text: "Always", value: "high" },
      { text: "Sometimes", value: "medium" },
      { text: "Rarely", value: "low" },
      { text: "Never", value: "none" },
    ],
  },
  {
    id: "device_usage",
    question: "Roughly how many hours per day do you use electronic devices (phone, laptop, TV, etc.)?",
    options: [
      { text: "Less than 2 hours", value: "less_2" },
      { text: "2–5 hours", value: "2_5" },
      { text: "5–8 hours", value: "5_8" },
      { text: "8+ hours", value: "8plus" },
    ],
  },
  {
    id: "food_waste",
    question: "How much food ends up being thrown away each week?",
    options: [
      { text: "Almost none (less than 1 meal)", value: "almost_none" },
      { text: "A little (1-2 meals)", value: "a_little" },
      { text: "Some (3-5 meals)", value: "some" },
      { text: "A lot (more than 5 meals)", value: "a_lot" },
    ],
  },
];

// --- DOM references ---
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const backBtn = document.getElementById("back-btn");

// --- state ---
let currentQuestion = 0;
let answers = {};

// --- render question ---
function renderQuestion() {
  const q = quizData[currentQuestion];
  questionEl.textContent = q.question;

  optionsEl.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.classList.add("option");
    btn.textContent = opt.text;
    btn.addEventListener("click", () => selectOption(opt.value));
    optionsEl.appendChild(btn);
  });

  // back button visibility
  backBtn.style.display = currentQuestion > 0 ? "inline-block" : "none";
}

// --- select option ---
function selectOption(value) {
  answers[quizData[currentQuestion].id] = value;

  currentQuestion++;
  if (currentQuestion < quizData.length) {
    renderQuestion();
  } else {
    submitQuiz();
  }
}

// --- back button ---
backBtn.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
});

// --- submit quiz ---
function submitQuiz() {
  // create form dynamically
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/calculate";

  for (const key in answers) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = answers[key];
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

// --- initialize ---
renderQuestion();
