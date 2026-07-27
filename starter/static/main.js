// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const SCOREBOARD_KEY = 'sudoku-scoreboard';
const THEME_KEY = 'sudoku-theme';
let puzzle = [];
let currentDifficulty = 'easy';
let timerInterval = null;
let elapsedSeconds = 0;
let gameCompleted = false;
let solution = [];

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = `Time: ${formatTime(elapsedSeconds)}`;
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
  gameCompleted = false;
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function getPlayerName() {
  const playerNameInput = document.getElementById('player-name');
  const name = playerNameInput ? playerNameInput.value.trim() : '';
  return name || 'Anonymous';
}

function loadScores() {
  try {
    const raw = window.localStorage.getItem(SCOREBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveScore(timeSeconds, difficulty) {
  const entry = {
    name: getPlayerName(),
    timeSeconds,
    difficulty,
    completedAt: new Date().toISOString()
  };

  const scores = loadScores()
    .concat(entry)
    .sort((a, b) => a.timeSeconds - b.timeSeconds)
    .slice(0, 10);

  window.localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(scores));
  renderScoreboard(scores);
}

function renderScoreboard(scores = loadScores()) {
  const scoreboardList = document.getElementById('scoreboard-list');
  if (!scoreboardList) {
    return;
  }

  scoreboardList.innerHTML = '';
  if (!scores.length) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No completed games yet.';
    scoreboardList.appendChild(emptyItem);
    return;
  }

  scores.forEach((score, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. ${score.name} - ${formatTime(score.timeSeconds)} (${score.difficulty})`;
    scoreboardList.appendChild(item);
  });
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.textContent = theme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';
  }
  window.localStorage.setItem(THEME_KEY, theme);
}

function initializeTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
}

function renderPuzzle(puz, solvedBoard = null) {
  puzzle = puz;
  solution = solvedBoard || [];
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  startTimer();
  const res = await fetch(`/new?difficulty=${encodeURIComponent(currentDifficulty)}`);
  const data = await res.json();
  if (data.difficulty) {
    currentDifficulty = data.difficulty;
    document.getElementById('difficulty').value = currentDifficulty;
  }
  renderPuzzle(data.puzzle, data.solution);
  document.getElementById('message').innerText = '';
}

function getBoardFromInputs() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

function highlightIncorrectCells(incorrectIndexes) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.className = 'sudoku-cell';
    if (incorrectIndexes.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
}

function applyHint() {
  if (!solution || solution.length !== SIZE) {
    return;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    const row = Number(inp.dataset.row);
    const col = Number(inp.dataset.col);
    if (inp.value === '') {
      const correctValue = solution[row][col];
      inp.value = correctValue;
      inp.disabled = true;
      inp.className = 'sudoku-cell prefilled';
      break;
    }
  }
}

async function checkSolution() {
  const board = getBoardFromInputs();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  highlightIncorrectCells(incorrect);
  if (incorrect.size === 0) {
    gameCompleted = true;
    stopTimer();
    saveScore(elapsedSeconds, currentDifficulty);
    msg.style.color = '#388e3c';
    msg.innerText = `Congratulations! You solved it in ${formatTime(elapsedSeconds)}.`;
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  const difficultySelect = document.getElementById('difficulty');
  const themeToggle = document.getElementById('theme-toggle');
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint').addEventListener('click', applyHint);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  difficultySelect.addEventListener('change', (event) => {
    currentDifficulty = event.target.value;
    newGame();
  });
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
  });
  initializeTheme();
  renderScoreboard();
  // initialize
  newGame();
});