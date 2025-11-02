const startBtn = document.getElementById("start-btn");
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const resultEl = document.getElementById("result");
const backBtn = document.getElementById("back-btn");

startBtn.addEventListener("click", () => {
  homeScreen.classList.add("fade-out");
  setTimeout(() => {
    homeScreen.classList.remove("active");
    quizScreen.classList.add("active", "fade-in");
    loadQuestion();
  }, 800);
});

const quizData = [
  {
    question: "How often do you eat meat or dairy products?",
    options: [
      "Every day",
      "A few times per week",
      "Rarely",
      "Never (plant-based)",
    ],
    scores: [0, 1, 2, 3],
  },
  {
    question: "What is your main mode of daily transport?",
    options: [
      "Car (petrol/diesel)",
      "Car (electric/hybrid)",
      "Public transport",
      "Walking or cycling",
      "Work/study from home",
    ],
    scores: [0, 1, 2, 3, 3],
  },
  {
    question: "How many flights do you take per year (return trips)?",
    options: ["None", "1–2 short flights", "1–2 long flights", "3+ flights"],
    scores: [3, 2, 1, 0],
  },
  {
    question: "How is your home mainly powered or heated?",
    options: [
      "Electricity from renewable sources",
      "Electricity from mixed grid",
      "Gas or oil heating",
      "Unsure",
    ],
    scores: [3, 2, 1, 1],
  },
  {
    question: "How energy efficient is your home?",
    options: [
      "Very efficient",
      "Some improvements made",
      "Not very efficient",
      "Not sure",
    ],
    scores: [3, 2, 1, 1],
  },
  {
    question: "How often do you recycle household waste?",
    options: ["Always", "Often", "Sometimes", "Rarely"],
    scores: [3, 2, 1, 0],
  },
  {
    question: "Do you regularly buy second-hand or sustainable products?",
    options: ["Yes, most of the time", "Occasionally", "Rarely", "Never"],
    scores: [3, 2, 1, 0],
  },
  {
    question: "How much do you think about your carbon footprint when making decisions?",
    options: ["Always", "Sometimes", "Rarely", "Never"],
    scores: [3, 2, 1, 0],
  },
  {
    question: "How many hours per day do you use electronic devices?",
    options: ["Less than 2 hours", "2–5 hours", "5–8 hours", "8+ hours"],
    scores: [3, 2, 1, 0],
  },
  {
    question: "How much food ends up being thrown away each week?",
    options: ["Almost none", "A little", "Some", "A lot"],
    scores: [3, 2, 1, 0],
  },
];

let currentQuestion = 0;
let answers = Array(quizData.length).fill(null);

function loadQuestion() {
  resultEl.textContent = "";
  const current = quizData[currentQuestion];
  questionEl.textContent = current.question;
  optionsEl.innerHTML = "";

  current.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option");

    if (answers[currentQuestion] === i) {
      btn.style.background = "#c8f7c5";
    }

    btn.addEventListener("click", () => selectOption(i));
    optionsEl.appendChild(btn);
  });

  backBtn.style.display = currentQuestion > 0 ? "inline-block" : "none";
}

function selectOption(index) {
  answers[currentQuestion] = index;

  setTimeout(() => {
    if (currentQuestion < quizData.length - 1) {
      currentQuestion++;
      loadQuestion();
    } else {
      showResult();
    }
  }, 600);
}

backBtn.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
});

function calculateScore() {
  return answers.reduce((total, ans, i) => {
    if (ans !== null) total += quizData[i].scores[ans];
    return total;
  }, 0);
}

function showResult() {
  questionEl.textContent = "";
  optionsEl.innerHTML = "";
  backBtn.style.display = "none";

  const score = calculateScore();
  const maxScore = quizData.length * 3;
  const percent = Math.round((score / maxScore) * 100);

  let message = "";
  if (percent >= 75) message = "🌿 Excellent! You're living sustainably!";
  else if (percent >= 50) message = "🌱 Not bad! There's room for greener choices.";
  else message = "🔥 Try making a few small eco-friendly changes.";

  resultEl.innerHTML = `
    <p>Your Sustainability Score: <b>${percent}%</b></p>
    <p>${message}</p>
  `;
}