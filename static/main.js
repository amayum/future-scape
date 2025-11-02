const startBtn = document.getElementById("start-btn");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    window.location.href = "/quiz"; // Flask route
  });
}