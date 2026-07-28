// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let timerInterval = null;
let startTime = null;
let hintsUsed = 0;
const LEADERBOARD_KEY = 'sudoku-leaderboard';
const THEME_KEY = 'sudoku-theme';

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

function loadTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  return savedTheme || 'light';
}

function saveTheme(theme) {
  window.localStorage.setItem(THEME_KEY, theme);
}

function loadLeaderboard() {
  const stored = window.localStorage.getItem(LEADERBOARD_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLeaderboard(entries) {
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const entries = loadLeaderboard().slice(0, 10);
  list.innerHTML = '';
  if (entries.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'No completed games yet.';
    list.appendChild(item);
    return;
  }
  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. ${entry.name} — ${entry.difficulty} — ${entry.time} — hints: ${entry.hintsUsed}`;
    list.appendChild(item);
  });
}

function recordScore() {
  const name = window.prompt('Enter your name for the leaderboard:', 'Player');
  if (!name) {
    return;
  }
  const entries = loadLeaderboard();
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  entries.push({
    name: name.trim(),
    time: formatTime(elapsed),
    difficulty: document.getElementById('difficulty').value,
    hintsUsed
  });
  entries.sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;
    return timeA.localeCompare(timeB);
  });
  saveLeaderboard(entries.slice(0, 10));
  renderLeaderboard();
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
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimer() {
  const timerEl = document.getElementById('timer');
  if (!startTime) {
    timerEl.innerText = 'Time: 00:00';
    return;
  }
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerEl.innerText = `Time: ${formatTime(elapsed)}`;
}

function startTimer() {
  stopTimer();
  startTime = Date.now();
  updateTimer();
  timerInterval = window.setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  startTime = null;
  updateTimer();
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${difficulty}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  hintsUsed = 0;
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
    inp.className = 'sudoku-cell';
    if (incorrect.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
  if (incorrect.size === 0) {
    stopTimer();
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
    recordScore();
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function checkPuzzle() {
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
    inp.className = 'sudoku-cell';
    if (incorrect.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }
  if (incorrect.size === 0) {
    stopTimer();
    msg.style.color = '#388e3c';
    msg.innerText = 'Puzzle solved correctly!';
    recordScore();
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function requestHint() {
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

  puzzle[data.row][data.col] = data.value;
  const idx = data.row * SIZE + data.col;
  const inp = inputs[idx];
  inp.value = data.value;
  inp.disabled = true;
  inp.className = 'sudoku-cell prefilled';
  hintsUsed += 1;
  msg.style.color = '#388e3c';
  msg.innerText = 'Hint applied.';
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  saveTheme(nextTheme);
}

// Wire buttons
window.addEventListener('load', () => {
  const difficultySelect = document.getElementById('difficulty');
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('check-puzzle').addEventListener('click', checkPuzzle);
  document.getElementById('hint-button').addEventListener('click', requestHint);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  difficultySelect.addEventListener('change', newGame);
  applyTheme(loadTheme());
  resetTimer();
  renderLeaderboard();
  newGame();
});