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
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '🌙 Dark Mode' : '🌞 Light Mode';
  }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimer();
  }, 1000);
  updateTimer();
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
  const timer = document.getElementById('timer');
  if (!timer) {
    return;
  }
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  timer.textContent = `${minutes}:${seconds}`;
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
      input.addEventListener('input', async (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;

        if (!val) {
          e.target.className = 'sudoku-cell';
          return;
        }

        const row = parseInt(e.target.dataset.row, 10);
        const col = parseInt(e.target.dataset.col, 10);
        const res = await fetch('/validate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({row, col, value: parseInt(val, 10)})
        });
        const data = await res.json();

        if (data.correct) {
          e.target.className = 'sudoku-cell';
        } else {
          e.target.className = 'sudoku-cell incorrect';
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
  const difficultySelect = document.getElementById('difficulty-select');
  const difficulty = difficultySelect.value;
  const clues = DIFFICULTY_CLUES[difficulty] || 35;
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

  if (data.error) {
    document.getElementById('message').innerText = data.error;
    return;
  }

  if (data.message) {
    document.getElementById('message').innerText = data.message;
    return;
  }

  const idx = data.row * SIZE + data.col;
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const inp = inputs[idx];
  inp.value = data.value;
  inp.disabled = true;
  inp.className = 'sudoku-cell prefilled';
}

// Wire buttons
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDarkMode = document.body.classList.contains('dark-mode');
      const nextTheme = isDarkMode ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      applyTheme(nextTheme);
    });
  }

  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint-button').addEventListener('click', hintGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  // initialize
  newGame();
});