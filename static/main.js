// Wait until DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const homeScreen = document.getElementById("home-screen");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      // Add fade-out animation class
      homeScreen.classList.add("fade-out");

      // Redirect after animation
      setTimeout(() => {
        window.location.href = "quiz.html";
      }, 800);
    });
  }
});
