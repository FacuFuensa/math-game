let level = 1;
let score = 0;
let difficulty = "easy";
let correctAnswer = 0;

function startGame(selectedDifficulty) {
  difficulty = selectedDifficulty;
  level = 1;
  score = 0;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  updateTexts();
  generateQuestion();
}

function updateTexts() {
  document.getElementById("levelText").textContent =
    `Level ${level} (${difficulty.toUpperCase()})`;
  document.getElementById("scoreText").textContent =
    `Score: ${score}`;
}

function generateQuestion() {
  let max;

  if (difficulty === "easy") max = 10;
  else if (difficulty === "medium") max = 25;
  else max = 50;

  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * max) + 1;

  correctAnswer = a + b;

  document.getElementById("question").textContent =
    `What is ${a} + ${b}?`;

  document.getElementById("answer").value = "";
  document.getElementById("feedback").textContent = "";
}

function submitAnswer() {
  const userAnswer = Number(document.getElementById("answer").value);
  const feedback = document.getElementById("feedback");

  if (userAnswer === correctAnswer) {
    feedback.textContent = "Correct! ✅";
    score += 10;
    level++;
    updateTexts();
    generateQuestion();
  } else {
    feedback.textContent = "Wrong answer ❌ Try again.";
  }
}
