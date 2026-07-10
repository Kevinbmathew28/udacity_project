// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
const DIFFICULTY_CLUES = {
  easy: 40,
  medium: 32,
  hard: 26
};
let puzzle = [];
let timerInterval;
let elapsedSeconds = 0;

function applyTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  const themeButton = document.getElementById('theme-toggle');
  if (themeButton) {
    themeButton.textContent = theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode';
  }
}

function toggleTheme() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const nextTheme = isDarkMode ? 'light' : 'dark';
  localStorage.setItem('sudoku-theme', nextTheme);
  applyTheme(nextTheme);
}

function startTimer() {
  if (timerInterval) {
    return;
  }
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimer();
}

function updateTimer() {
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  const timer = document.getElementById('timer');
  if (timer) {
    timer.textContent = `${minutes}:${seconds}`;
  }
}

function loadLeaderboard() {
  const stored = localStorage.getItem('sudoku-leaderboard');
  return stored ? JSON.parse(stored) : [];
}

function saveLeaderboard(entries) {
  localStorage.setItem('sudoku-leaderboard', JSON.stringify(entries));
}

function renderLeaderboard() {
  const tbody = document.querySelector('#leaderboard tbody');
  if (!tbody) {
    return;
  }

  const entries = loadLeaderboard();
  tbody.innerHTML = '';

  if (entries.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No scores yet';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  entries.forEach((entry, index) => {
    const row = document.createElement('tr');
    const rankCell = document.createElement('td');
    rankCell.textContent = index + 1;
    row.appendChild(rankCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = entry.name;
    row.appendChild(nameCell);

    const difficultyCell = document.createElement('td');
    difficultyCell.textContent = entry.difficulty;
    row.appendChild(difficultyCell);

    const timeCell = document.createElement('td');
    timeCell.textContent = entry.time;
    row.appendChild(timeCell);

    tbody.appendChild(row);
  });
}

async function validateCellInput(event) {
  const input = event.target;
  const value = input.value;

  if (value === '') {
    input.className = 'sudoku-cell';
    return;
  }

  const row = parseInt(input.dataset.row, 10);
  const col = parseInt(input.dataset.col, 10);
  const res = await fetch('/validate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({row, col, value: parseInt(value, 10)})
  });
  const data = await res.json();

  input.className = data.correct ? 'sudoku-cell' : 'sudoku-cell incorrect';
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
        if (val !== '') {
          validateCellInput(e);
        }
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

async function newGame() {
  const difficultySelect = document.getElementById("difficulty");
  const difficulty = difficultySelect.value;
  const clues = DIFFICULTY_CLUES[difficulty];
  const res = await fetch(`/new?clues=${clues}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
  resetTimer();
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
    const playerName = window.prompt('Enter your name for the leaderboard:') || 'Anonymous';
    const difficultySelect = document.getElementById('difficulty');
    const difficulty = difficultySelect.value;
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    const time = `${minutes}:${seconds}`;
    const entries = loadLeaderboard();
    entries.push({name: playerName, difficulty, time});
    entries.sort((a, b) => {
      const aTime = a.time.split(':').reduce((total, part) => total * 60 + parseInt(part, 10), 0);
      const bTime = b.time.split(':').reduce((total, part) => total * 60 + parseInt(part, 10), 0);
      return aTime - bTime;
    });
    saveLeaderboard(entries.slice(0, 10));
    renderLeaderboard();
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

async function hintGame() {
  const res = await fetch('/hint', {method: 'POST'});
  const data = await res.json();
  const msg = document.getElementById('message');

  if (data.message) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.message;
    return;
  }

  const idx = data.row * SIZE + data.col;
  const input = document.querySelector(`.sudoku-cell[data-row="${data.row}"][data-col="${data.col}"]`);
  input.value = data.value;
  input.disabled = true;
  input.className = 'sudoku-cell prefilled';
  msg.style.color = '#388e3c';
  msg.innerText = 'Hint used.';
}

// Wire buttons
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('sudoku-theme') || 'light';
  applyTheme(savedTheme);

  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint-button').addEventListener('click', hintGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  renderLeaderboard();
  // initialize
  newGame();
});