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
let hintsUsed = 0;

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function showMessage(text, type = 'info') {
  const msg = document.getElementById('message');
  if (!msg) {
    return;
  }

  msg.textContent = text;
  if (type === 'error') {
    msg.style.color = '#d32f2f';
  } else if (type === 'success') {
    msg.style.color = '#388e3c';
  } else {
    msg.style.color = '#333';
  }
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
  hintsUsed = 0;
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
        updateLiveCellHighlighting();
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
    hintsUsed,
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
    const hints = score.hintsUsed != null ? score.hintsUsed : 0;
    item.textContent = `${index + 1}. ${score.name} - ${formatTime(score.timeSeconds)} (${score.difficulty}) - Hints: ${hints}`;
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
  try {
    const res = await fetch(`/new?difficulty=${encodeURIComponent(currentDifficulty)}`);
    if (!res.ok) {
      const data = await res.json();
      showMessage(data.error || 'Unable to start a new game.', 'error');
      return;
    }
    const data = await res.json();
    if (data.difficulty) {
      currentDifficulty = data.difficulty;
      document.getElementById('difficulty').value = currentDifficulty;
    }
    renderPuzzle(data.puzzle, data.solution);
    showMessage('New game started. Good luck!', 'info');
  } catch (error) {
    console.error('New game failed:', error);
    showMessage('Unable to start a new game. Check your connection.', 'error');
  }
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
    inp.className = 'sudoku-cell';

    if (inp.disabled) {
      inp.classList.add('prefilled');
      continue;
    }

    const row = Number(inp.dataset.row);
    const col = Number(inp.dataset.col);
    const cellValue = inp.value;
    const expectedValue = solution?.[row]?.[col];

    const isEmpty = cellValue === '';
    const isWrong = cellValue !== '' && expectedValue !== undefined && cellValue !== String(expectedValue);

    if (incorrectIndexes.has(idx) || isEmpty || isWrong) {
      inp.classList.add('incorrect');
    }
  }
}

function updateLiveCellHighlighting() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const conflictIndexes = new Set();

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }

    const row = Number(inp.dataset.row);
    const col = Number(inp.dataset.col);
    const value = inp.value;
    if (value === '') {
      continue;
    }

    for (let checkCol = 0; checkCol < SIZE; checkCol++) {
      const otherIdx = row * SIZE + checkCol;
      if (otherIdx !== idx && inputs[otherIdx].value === value) {
        conflictIndexes.add(idx);
        conflictIndexes.add(otherIdx);
      }
    }

    for (let checkRow = 0; checkRow < SIZE; checkRow++) {
      const otherIdx = checkRow * SIZE + col;
      if (otherIdx !== idx && inputs[otherIdx].value === value) {
        conflictIndexes.add(idx);
        conflictIndexes.add(otherIdx);
      }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        const otherIdx = r * SIZE + c;
        if (otherIdx !== idx && inputs[otherIdx].value === value) {
          conflictIndexes.add(idx);
          conflictIndexes.add(otherIdx);
        }
      }
    }
  }

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }

    if (conflictIndexes.has(idx)) {
      inp.classList.add('incorrect');
    } else {
      inp.classList.remove('incorrect');
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
      hintsUsed += 1;
      break;
    }
  }
}

async function checkSolution() {
  const board = getBoardFromInputs();
  const msg = document.getElementById('message');

  try {
    const res = await fetch('/check', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({board})
    });

    if (!res.ok) {
      const data = await res.json();
      showMessage(data.error || 'Unable to check the board.', 'error');
      return;
    }

    const data = await res.json();
    const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
    highlightIncorrectCells(incorrect);

    if (incorrect.size === 0) {
      gameCompleted = true;
      stopTimer();
      saveScore(elapsedSeconds, currentDifficulty);
      showMessage(`Congratulations! You solved it in ${formatTime(elapsedSeconds)}.`, 'success');
    } else {
      showMessage('Some cells are incorrect. Please fix the highlighted fields.', 'error');
    }
  } catch (error) {
    console.error('Check solution failed:', error);
    showMessage('Network error while checking the board. Please try again.', 'error');
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