let currentTable = 1;
let practiceMode = 'all'; // 'all' or 'single'
let tablesToPractice = [];
let currentTableIndex = 0;
let score = { correct: 0, incorrect: 0 };
let highScore = {
  score: 0,
  name: '',
  country: '',
  date: ''
};

const tableContainer = document.getElementById('table-container');
const title = document.getElementById('table-title');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');
const menuBtn = document.getElementById('menu-btn');
const tableSelect = document.getElementById('table-select');
const progressElement = document.getElementById('progress');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');
const controlsElement = document.querySelector('.controls');

function loadTable(n) {
  currentTable = n;
  title.textContent = `Table of ${n}`;
  tableContainer.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const row = document.createElement('div');
    row.classList.add('table-row');
    row.innerHTML = `
      <span>${n} × ${i} =</span>
      <input type="number" min="0" class="answer-input" />
    `;
    tableContainer.appendChild(row);
  }
  
  // Focus the first input
  const firstInput = tableContainer.querySelector('input');
  if (firstInput) firstInput.focus();
  
  // Update progress
  if (practiceMode === 'all') {
    progressElement.textContent = `Table ${currentTableIndex + 1} of ${tablesToPractice.length}`;
  } else {
    progressElement.textContent = '';
  }
  
  checkBtn.style.display = 'inline-block';
  nextBtn.style.display = 'none';
  
  // Reset all inputs
  const inputs = tableContainer.querySelectorAll('input');
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct', 'wrong');
  });
}

function updateScoreDisplay() {
  correctCountElement.textContent = score.correct;
  incorrectCountElement.textContent = score.incorrect;
}

function checkAnswers() {
  const inputs = tableContainer.querySelectorAll('input');
  let allCorrect = true;
  let allFilled = true;
  let correctInThisCheck = 0;
  let incorrectInThisCheck = 0;

  // Check if all inputs are filled
  inputs.forEach(input => {
    if (input.value.trim() === '') {
      allFilled = false;
      return;
    }
  });

  if (!allFilled) {
    alert('Please fill in all the answers before checking!');
    return;
  }

  // Check answers
  inputs.forEach((input, i) => {
    const correctAnswer = currentTable * (i + 1);
    if (parseInt(input.value) === correctAnswer) {
      if (!input.classList.contains('correct')) {
        correctInThisCheck++;
      }
      input.classList.add('correct');
      input.classList.remove('wrong');
    } else {
      if (!input.classList.contains('wrong')) {
        incorrectInThisCheck++;
      }
      input.classList.add('wrong');
      input.classList.remove('correct');
      allCorrect = false;
    }
  });

  // Update score
  score.correct += correctInThisCheck;
  score.incorrect += incorrectInThisCheck;
  updateScoreDisplay();

  if (allCorrect) {
    checkBtn.style.display = 'none';
    if (practiceMode === 'all' && currentTableIndex < tablesToPractice.length - 1) {
      nextBtn.textContent = 'Next Table';
    } else if (practiceMode === 'single') {
      nextBtn.textContent = 'Try Again';
    } else {
      nextBtn.textContent = 'All Done!';
    }
    nextBtn.style.display = 'inline-block';
  } else {
    // Scroll to the first wrong answer
    const firstWrong = tableContainer.querySelector('.wrong');
    if (firstWrong) {
      firstWrong.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function nextTable() {
  if (practiceMode === 'all') {
    currentTableIndex++;
    if (currentTableIndex < tablesToPractice.length) {
      loadTable(tablesToPractice[currentTableIndex]);
    } else {
      showCompletionMessage();
    }
  } else {
    // In single table mode, just reload the same table
    loadTable(currentTable);
  }
}

function showCompletionMessage() {
  tableContainer.innerHTML = `
    <div class="completion-message">
      <h3>🎉 Great job!</h3>
      <p>You've completed all the tables you selected!</p>
      <button id="restart-btn">Practice Again</button>
    </div>
  `;
  title.textContent = 'Well done!';
  checkBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  
  // Add event listener for the restart button
  document.getElementById('restart-btn').addEventListener('click', startPractice);
}

function startPractice() {
  const selectedValue = tableSelect.value;
  
  // Only reset score if it's a new practice session (score is 0)
  if (score.correct === 0 && score.incorrect === 0) {
    score = { correct: 0, incorrect: 0 };
    updateScoreDisplay();
  }
  
  if (selectedValue === 'all') {
    practiceMode = 'all';
    // Create array of all tables in order from 1 to 10
    tablesToPractice = Array.from({length: 10}, (_, i) => i + 1);
    currentTableIndex = 0;
    loadTable(tablesToPractice[0]);
  } else {
    practiceMode = 'single';
    currentTable = parseInt(selectedValue);
    loadTable(currentTable);
  }
  
    // Show the practice area and hide the controls
  showPracticeArea();
}

// Show/hide high score button removed - high score is now always visible on main page

// Event Listeners
checkBtn.addEventListener('click', checkAnswers);
nextBtn.addEventListener('click', nextTable);
startBtn.addEventListener('click', startPractice);

// Allow pressing Enter to check answers
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (checkBtn.style.display !== 'none') {
      checkAnswers();
    } else if (nextBtn.style.display !== 'none') {
      nextTable();
    }
  }
});

// Initially hide the practice area, score counter, and menu button
// Make sure high score is visible on main page
document.getElementById('high-score').style.display = 'block';
tableContainer.style.display = 'none';
checkBtn.style.display = 'none';
nextBtn.style.display = 'none';
menuBtn.style.display = 'none';
document.querySelector('.score-counter').style.display = 'none';
title.style.display = 'none';
progressElement.style.display = 'none';

// Show practice area and setup
function showPracticeArea() {
  controlsElement.style.display = 'none';
  tableContainer.style.display = 'block';
  document.querySelector('.score-counter').style.display = 'flex';
  document.getElementById('high-score').style.display = 'none'; // Hide high score
  checkBtn.style.display = 'inline-block';
  nextBtn.style.display = 'none';
  menuBtn.style.display = 'inline-block';
  title.style.display = 'block';
  progressElement.style.display = 'block';
}

// Load high score from localStorage
function loadHighScore() {
  const savedHighScore = localStorage.getItem('multiplicationHighScore');
  if (savedHighScore) {
    highScore = JSON.parse(savedHighScore);
    updateHighScoreDisplay();
  }
}

// Save high score to localStorage
function saveHighScore() {
  localStorage.setItem('multiplicationHighScore', JSON.stringify(highScore));
  updateHighScoreDisplay();
}

// Update high score display
function updateHighScoreDisplay() {
  const highScoreDisplay = document.getElementById('high-score-display');
  if (highScore.score > 0) {
    const date = new Date(highScore.date);
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    
    highScoreDisplay.innerHTML = `
      <div>${highScore.score} correct answers</div>
      <div>By ${highScore.name} from ${highScore.country}</div>
      <div class="high-score-date">${formattedDate}</div>
    `;
  } else {
    highScoreDisplay.textContent = 'No high score yet!';
  }
}

// Check and update high score
function checkHighScore() {
  if (score.correct > highScore.score) {
    const name = prompt('New High Score! Enter your name:');
    if (name) {
      const country = prompt('Enter your country:') || 'Unknown';
      highScore = {
        score: score.correct,
        name: name.trim(),
        country: country.trim(),
        date: new Date().toISOString()
      };
      saveHighScore();
      return true;
    }
  }
  return false;
}

// Show main menu
function showMainMenu() {
  // Don't check high score when just switching tables
  // Only check when finishing a practice session
  if (score.correct > 0 && (practiceMode === 'all' || confirm('End this practice session and check for high score?'))) {
    checkHighScore();
  }
  
  controlsElement.style.display = 'flex';
  tableContainer.style.display = 'none';
  document.querySelector('.score-counter').style.display = 'none';
  document.getElementById('high-score').style.display = 'block'; // Always show high score on main page
  checkBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  menuBtn.style.display = 'none';
  title.style.display = 'none';
  progressElement.style.display = 'none';
  
  // Update high score display
  updateHighScoreDisplay();
}

// Reset high score functionality removed

// Source code button functionality removed

// Initialize high score on page load
document.addEventListener('DOMContentLoaded', () => {
  loadHighScore();
});

// Event Listeners
startBtn.addEventListener('click', showPracticeArea);
menuBtn.addEventListener('click', showMainMenu);