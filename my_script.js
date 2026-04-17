const state = {
  currentTable: 1,
  practiceMode: 'all',
  tablesToPractice: [],
  currentTableIndex: 0,
  score: { correct: 0, incorrect: 0 }
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
  state.currentTable = n;
  title.textContent = `Table of ${n}`;
  tableContainer.innerHTML = '';
  
  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= 10; i++) {
    const row = document.createElement('div');
    row.classList.add('table-row');
    row.innerHTML = `
      <span>${n} × ${i} =</span>
      <input type="number" min="0" class="answer-input" />
    `;
    fragment.appendChild(row);
  }
  tableContainer.appendChild(fragment);
  
  const firstInput = tableContainer.querySelector('input');
  if (firstInput) firstInput.focus();
  
  if (state.practiceMode === 'all') {
    progressElement.textContent = `Table ${state.currentTableIndex + 1} of ${state.tablesToPractice.length}`;
  } else {
    progressElement.textContent = '';
  }
  
  checkBtn.style.display = 'inline-block';
  nextBtn.style.display = 'none';
  
  const inputs = tableContainer.querySelectorAll('input');
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct', 'wrong');
  });
}

function updateScoreDisplay() {
  correctCountElement.textContent = state.score.correct;
  incorrectCountElement.textContent = state.score.incorrect;
}

function resetScore() {
  state.score = { correct: 0, incorrect: 0 };
  updateScoreDisplay();
}

function checkAnswers() {
  const inputs = tableContainer.querySelectorAll('input:not([disabled])');
  if (inputs.length === 0) return;

  let allCorrect = true;
  let correctInThisCheck = 0;
  let incorrectInThisCheck = 0;

  const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');

  if (!allFilled) {
    showMessageModal('Please fill in all the answers first! 📝');
    return;
  }

  const allInputs = tableContainer.querySelectorAll('input');
  allInputs.forEach((input, i) => {
    if (input.disabled) return;

    const correctAnswer = state.currentTable * (i + 1);
    if (parseInt(input.value) === correctAnswer) {
      correctInThisCheck++;
      input.classList.add('correct');
      input.classList.remove('wrong');
      input.disabled = true; // Prevent double-scoring
    } else {
      if (!input.classList.contains('wrong')) {
        incorrectInThisCheck++;
      }
      input.classList.add('wrong');
      input.classList.remove('correct');
      allCorrect = false;
    }
  });

  state.score.correct += correctInThisCheck;
  state.score.incorrect += incorrectInThisCheck;
  updateScoreDisplay();

  const totalInputs = allInputs.length;
  const disabledInputs = tableContainer.querySelectorAll('input[disabled]').length;

  if (disabledInputs === totalInputs) {
    celebrateTableCompletion();
    checkBtn.style.display = 'none';
    if (state.practiceMode === 'all' && state.currentTableIndex < state.tablesToPractice.length - 1) {
      nextBtn.textContent = 'Next Table 🎯';
    } else if (state.practiceMode === 'single') {
      nextBtn.textContent = 'Try Again 🔄';
    } else {
      nextBtn.textContent = 'All Done! 🌟';
    }
    nextBtn.style.display = 'inline-block';
  } else {
    const firstWrong = tableContainer.querySelector('.wrong');
    if (firstWrong) {
      firstWrong.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function celebrateTableCompletion() {
  const tableRows = document.querySelectorAll('.table-row');
  tableRows.forEach((row, index) => {
    setTimeout(() => {
      row.classList.add('celebrate');
      setTimeout(() => row.classList.remove('celebrate'), 500);
    }, index * 50);
  });
}

function showMessageModal(message) {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <button class="modal-btn">OK 👍</button>
    </div>
  `;
  document.body.appendChild(overlay);
  
  overlay.querySelector('.modal-btn').addEventListener('click', () => overlay.remove());
}

function nextTable() {
  if (state.practiceMode === 'all') {
    state.currentTableIndex++;
    if (state.currentTableIndex < state.tablesToPractice.length) {
      loadTable(state.tablesToPractice[state.currentTableIndex]);
    } else {
      showCompletionMessage();
    }
  } else {
    loadTable(state.currentTable);
  }
}

function showCompletionMessage() {
  resetScore();
  
  tableContainer.innerHTML = `
    <div class="completion-message">
      <div class="completion-emoji">🎉</div>
      <h3>Amazing Job!</h3>
      <p>You've completed all the tables you selected!</p>
      <button id="restart-btn" class="primary">Play Again 🎮</button>
      <button id="menu-btn-completion" class="secondary">Main Menu 🏠</button>
    </div>
  `;
  title.textContent = 'Well done!';
  checkBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  
  document.getElementById('restart-btn').addEventListener('click', startPractice);
  document.getElementById('menu-btn-completion').addEventListener('click', () => {
    tableContainer.style.display = 'none';
    showMainMenu();
  });
}

function startPractice() {
  const selectedValue = tableSelect.value;
  
  resetScore();
  
  if (selectedValue === 'all') {
    state.practiceMode = 'all';
    state.tablesToPractice = Array.from({length: 10}, (_, i) => i + 1);
    state.currentTableIndex = 0;
    loadTable(state.tablesToPractice[0]);
  } else {
    state.practiceMode = 'single';
    state.currentTable = parseInt(selectedValue);
    loadTable(state.currentTable);
  }
  
  showPracticeArea();
}

checkBtn.addEventListener('click', checkAnswers);
nextBtn.addEventListener('click', nextTable);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      const btn = modal.querySelector('.modal-btn:not(.secondary)');
      if (btn) btn.click();
      return;
    }
    if (checkBtn.style.display !== 'none') {
      checkAnswers();
    } else if (nextBtn.style.display !== 'none') {
      nextTable();
    }
  }
});

tableContainer.style.display = 'none';
checkBtn.style.display = 'none';
nextBtn.style.display = 'none';
menuBtn.style.display = 'none';
document.querySelector('.score-counter').style.display = 'none';
title.style.display = 'none';
progressElement.style.display = 'none';

function showPracticeArea() {
  controlsElement.style.display = 'none';
  tableContainer.style.display = 'flex';
  document.querySelector('.score-counter').style.display = 'flex';
  document.querySelector('.button-group').style.display = 'flex';
  checkBtn.style.display = 'inline-block';
  nextBtn.style.display = 'none';
  menuBtn.style.display = 'inline-block';
  title.style.display = 'block';
  progressElement.style.display = 'block';
}

function showMainMenu() {
  controlsElement.style.display = 'flex';
  tableContainer.style.display = 'none';
  document.querySelector('.score-counter').style.display = 'none';
  document.querySelector('.button-group').style.display = 'none';
  checkBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  menuBtn.style.display = 'none';
  title.style.display = 'none';
  progressElement.style.display = 'none';
  
  resetScore();
}

document.addEventListener('DOMContentLoaded', () => {
});

startBtn.addEventListener('click', () => {
  startPractice();
});

menuBtn.addEventListener('click', () => {
  showMainMenu();
});