const questions = [
  {
    question: "How often do you eat meat or dairy?",
    options: ["Less than £20", "£20-£50", "£50-£100", "Over £100"]
  },
  {
    question: "How do you usually travel?",
    options: ["Car", "Public transport", "Walk or cycle", "Work from home"]
  }
];

let currentQuestion = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const backBtn = document.getElementById("back-btn");

function loadQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option");
    btn.onclick = () => {
      btn.classList.add("selected");
      if(currentQuestion < questions.length - 1){
        currentQuestion++;
        loadQuestion();
      } else {
        window.location.href = "results.html";
      }
    }
    optionsEl.appendChild(btn);
  });

  backBtn.style.display = currentQuestion === 0 ? "none" : "inline-block";
}

backBtn.addEventListener("click", () => {
  if(currentQuestion > 0){
    currentQuestion--;
    loadQuestion();
  }
});

loadQuestion();
