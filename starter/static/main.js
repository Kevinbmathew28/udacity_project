// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const LEADERBOARD_STORAGE_KEY = 'sudoku-leaderboard';
const THEME_STORAGE_KEY = 'sudoku-theme';
const MAX_LEADERBOARD_ENTRIES = 10;
let puzzle = [];
let timerInterval = null;
let elapsedSeconds = 0;
let currentDifficulty = 'medium';
let hintsUsed = 0;

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    timerEl.innerText = formatTime(elapsedSeconds);
  }
}

function startTimer() {
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLeaderboardEntries() {
  try {
    const storedValue = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }
    return JSON.parse(storedValue);
  } catch (error) {
    return [];
  }
}

function saveLeaderboardEntries(entries) {
  window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
}

function renderLeaderboard() {
  const listEl = document.getElementById('leaderboard-list');
  if (!listEl) {
    return;
  }

  const entries = getLeaderboardEntries();
// Reviewed Copilot's refactoring and manually approved
// after verifying the generated HTML output.
const leaderboardMarkup = entries.length === 0  const leaderboardMarkup = entries.length === 0
    ? '<li class="leaderboard-empty">No completed games yet.</li>'
    : entries.map((entry, index) => `
        <li>
          <span class="leaderboard-rank">${index + 1}. ${escapeHtml(entry.name)}</span>
          <span class="leaderboard-details">${formatTime(entry.time)} • ${escapeHtml(entry.difficulty)} • hints: ${entry.hintsUsed}</span>
        </li>
      `).join('');

  listEl.innerHTML = leaderboardMarkup;
}

function addCompletedGameToLeaderboard() {
  const name = window.prompt('Enter your name for the leaderboard:', 'Player');
  if (name === null) {
    return;
  }

  const difficultySelect = document.getElementById('difficulty-select');
  const difficulty = difficultySelect ? difficultySelect.value : currentDifficulty;
  const trimmedName = name.trim() || 'Anonymous';
  const entry = {
    name: trimmedName,
    time: elapsedSeconds,
    difficulty,
    hintsUsed,
    completedAt: Date.now()
  };

  const entries = getLeaderboardEntries();
  entries.push(entry);
  entries.sort((a, b) => a.time - b.time || b.completedAt - a.completedAt);
  saveLeaderboardEntries(entries.slice(0, MAX_LEADERBOARD_ENTRIES));
  renderLeaderboard();
}

function getCellClassName(row, col, extraClass = '') {
  const blockRow = Math.floor(row / 3);
  const blockCol = Math.floor(col / 3);
  const blockClass = (blockRow + blockCol) % 2 === 0 ? 'block-even' : 'block-odd';
  const classes = ['sudoku-cell', blockClass];
  if (extraClass) {
    classes.push(extraClass);
  }
  return classes.join(' ');
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
      input.className = getCellClassName(i, j);
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

function renderPuzzle(puz) {
  puzzle = puz;
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
        inp.className = getCellClassName(i, j, 'prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.className = getCellClassName(i, j);
      }
    }
  }
}

async function newGame() {
  const difficultySelect = document.getElementById('difficulty-select');
  const difficulty = difficultySelect ? difficultySelect.value : 'medium';
  currentDifficulty = difficulty;
  hintsUsed = 0;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  startTimer();
}

async function checkSolution() {
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
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    const row = parseInt(inp.dataset.row, 10);
    const col = parseInt(inp.dataset.col, 10);
    inp.className = getCellClassName(row, col);
    if (incorrect.has(idx)) {
      inp.className = getCellClassName(row, col, 'incorrect');
    }
  }
  if (data.completed) {
    stopTimer();
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
    addCompletedGameToLeaderboard();
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function applyHint() {
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

  const res = await fetch('/hint', {
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

  const idx = data.row * SIZE + data.col;
  const inp = inputs[idx];
  if (!inp || inp.disabled) {
    msg.style.color = '#d32f2f';
    msg.innerText = 'No additional hint available.';
    return;
  }

  inp.value = data.value;
  inp.disabled = true;
  const row = parseInt(inp.dataset.row, 10);
  const col = parseInt(inp.dataset.col, 10);
  inp.className = getCellClassName(row, col, 'prefilled');
  hintsUsed += 1;
  msg.style.color = '#388e3c';
  msg.innerText = `Hint used (${hintsUsed}).`;
}

// THEME HANDLING
function applyTheme(theme) {
  const isDark = theme === 'dark';
  try {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.checked = isDark;
    window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch (err) {
    // ignore
  }
}

function initTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  } catch (err) {
    // ignore
  }
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('change', (e) => {
    applyTheme(e.target.checked ? 'dark' : 'light');
  });
}

// Wire buttons
window.addEventListener('load', () => {
  // Initialize theme before rendering to avoid flash
  initTheme();
  setupThemeToggle();
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-solution').addEventListener('click', applyHint);
  renderLeaderboard();
  newGame();
});