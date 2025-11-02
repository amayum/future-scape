const quizScreen = document.getElementById("quiz-screen");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const backBtn = document.getElementById("back-btn");

const quizData = [
  {
    question: "How much do you spend on meat and dairy per week?",
    options: [
      "Less than £20",
      "£20-£50", 
      "£50-£100",
      "Over £100"
    ],
    name: "meat_dairy"
  },
  {
    question: "What is your main mode of daily transport?",
    options: [
      "Car (petrol/diesel)",
      "Car (electric/hybrid)",
      "Public transport",
      "Walking or cycling",
      "Work/study from home"
    ],
    name: "transport"
  },
  {
    question: "How many flights do you take per year?",
    options: [
      "None",
      "1-2 short flights",
      "1-2 long flights", 
      "3+ flights"
    ],
    name: "flights"
  },
  {
    question: "How is your home mainly powered or heated?",
    options: [
      "Renewable sources",
      "Mixed grid electricity",
      "Gas or oil heating",
      "Unsure"
    ],
    name: "home_energy_source"
  },
  {
    question: "How energy efficient is your home?",
    options: [
      "Very efficient",
      "Some improvements made",
      "Not very efficient",
      "Not sure"
    ],
    name: "home_efficiency"
  },
  {
    question: "How often do you recycle household waste?",
    options: ["Always", "Often", "Sometimes", "Rarely"],
    name: "recycling"
  },
  {
    question: "Do you regularly buy second-hand or sustainable products?",
    options: ["Most of the time", "Occasionally", "Rarely", "Never"],
    name: "sustainable_shopping"
  },
  {
    question: "How much do you think about your carbon footprint when making decisions?",
    options: ["Always", "Sometimes", "Rarely", "Never"],
    name: "carbon_awareness"
  },
  {
    question: "How many hours per day do you use electronic devices?",
    options: ["Less than 2 hours", "2-5 hours", "5-8 hours", "8+ hours"],
    name: "device_usage"
  },
  {
    question: "How much food ends up being thrown away each week?",
    options: ["Almost none", "A little", "Some", "A lot"],
    name: "food_waste"
  }
];

let currentQuestion = 0;
let answers = {};

// initialise quiz
loadQuestion();

function loadQuestion() {
  const current = quizData[currentQuestion];
  questionEl.textContent = current.question;
  optionsEl.innerHTML = "";

  current.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option");

    // check if this option is selected
    if (answers[current.name] === getOptionValue(current.name, i)) {
      btn.style.background = "#c8f7c5";
    }

    btn.addEventListener("click", () => selectOption(current.name, i));
    optionsEl.appendChild(btn);
  });

  backBtn.style.display = currentQuestion > 0 ? "inline-block" : "none";
}

// map option indices to the values expected by your Flask backend
function getOptionValue(questionName, optionIndex) {
  const valueMaps = {
    meat_dairy: ["less_20", "20_50", "50_100", "over_100"],
    transport: ["car_petrol", "car_electric", "public", "walk_cycle", "home"],
    flights: ["none", "short", "long", "3plus"],
    home_energy_source: ["renewable", "mixed", "gas_oil", "unsure"],
    home_efficiency: ["very", "some", "not_very", "not_sure"],
    recycling: ["always", "often", "sometimes", "rarely"],
    sustainable_shopping: ["most", "occasionally", "rarely", "never"],
    carbon_awareness: ["always", "sometimes", "rarely", "never"],
    device_usage: ["less_2", "2_5", "5_8", "8plus"],
    food_waste: ["almost_none", "a_little", "some", "a_lot"]
  };
  
  return valueMaps[questionName][optionIndex];
}

function selectOption(questionName, optionIndex) {
  const value = getOptionValue(questionName, optionIndex);
  answers[questionName] = value;

  // visual feedback
  const buttons = optionsEl.querySelectorAll('.option');
  buttons.forEach(btn => btn.style.background = '');
  buttons[optionIndex].style.background = '#c8f7c5';

  setTimeout(() => {
    if (currentQuestion < quizData.length - 1) {
      currentQuestion++;
      loadQuestion();
    } else {
      submitQuizToBackend();
    }
  }, 600);
}

backBtn.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
});

function submitQuizToBackend() {
  // create a form and submit it to match your Flask backend expectations
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/calculate';
  
  // add all answers as hidden form fields
  Object.keys(answers).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = answers[key];
    form.appendChild(input);
  });
  
  document.body.appendChild(form);
  form.submit();
}