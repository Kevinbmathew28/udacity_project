// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let solution = [];
let hintCount = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let timerRunning = false;
let completed = false;
let currentDifficulty = 'medium';
const LEADERBOARD_STORAGE_KEY = 'sudoku-leaderboard';
const THEME_STORAGE_KEY = 'sudoku-theme';
let currentTheme = 'light';

function isValidPlacement(row, col, value) {
  if (!value) {
    return true;
  }

  for (let c = 0; c < SIZE; c += 1) {
    if (c !== col && puzzle[row][c] === value) {
      return false;
    }
  }

  for (let r = 0; r < SIZE; r += 1) {
    if (r !== row && puzzle[r][col] === value) {
      return false;
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if ((r !== row || c !== col) && puzzle[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

function clearCellHighlights() {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx += 1) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }
    inp.className = 'sudoku-cell';
  }
}

function applyCheckHighlights(incorrectIndices) {
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx += 1) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }
    inp.className = 'sudoku-cell';
  }

  for (let idx = 0; idx < inputs.length; idx += 1) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }
    if (incorrectIndices.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
      const row = Math.floor(idx / SIZE);
      const col = idx % SIZE;
      const value = puzzle[row][col];
      if (value) {
        for (let i = 0; i < SIZE; i += 1) {
          const otherIndex = row * SIZE + i;
          if (otherIndex !== idx && puzzle[row][i] === value) {
            inputs[otherIndex].className = 'sudoku-cell invalid';
          }
        }
        for (let i = 0; i < SIZE; i += 1) {
          const otherIndex = i * SIZE + col;
          if (otherIndex !== idx && puzzle[i][col] === value) {
            inputs[otherIndex].className = 'sudoku-cell invalid';
          }
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r += 1) {
          for (let c = boxCol; c < boxCol + 3; c += 1) {
            const otherIndex = r * SIZE + c;
            if (otherIndex !== idx && puzzle[r][c] === value) {
              inputs[otherIndex].className = 'sudoku-cell invalid';
            }
          }
        }
      }
    }
  }
}

function highlightConflicts(row, col, value) {
  clearCellHighlights();
  if (!value) {
    return;
  }

  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  const targetIndex = row * SIZE + col;
  const targetInput = inputs[targetIndex];

  if (!targetInput) {
    return;
  }

  const invalid = !isValidPlacement(row, col, value);
  if (invalid) {
    targetInput.className = 'sudoku-cell invalid';
  }

  for (let c = 0; c < SIZE; c += 1) {
    if (c !== col && puzzle[row][c] === value) {
      const input = inputs[row * SIZE + c];
      input.className = 'sudoku-cell invalid';
    }
  }

  for (let r = 0; r < SIZE; r += 1) {
    if (r !== row && puzzle[r][col] === value) {
      const input = inputs[r * SIZE + col];
      input.className = 'sudoku-cell invalid';
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if ((r !== row || c !== col) && puzzle[r][c] === value) {
        const input = inputs[r * SIZE + c];
        input.className = 'sudoku-cell invalid';
      }
    }
  }
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
        if (completed) {
          e.target.value = '';
          return;
        }
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        const row = Number(e.target.dataset.row);
        const col = Number(e.target.dataset.col);
        const numericValue = val ? parseInt(val, 10) : 0;
        puzzle[row][col] = numericValue;
        highlightConflicts(row, col, numericValue);
        checkCompletion();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('timer');
  timerEl.innerText = formatTime(elapsedSeconds);
}

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  elapsedSeconds = 0;
  timerRunning = true;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    if (!timerRunning) {
      return;
    }
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getLeaderboard() {
  const stored = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

function saveLeaderboard(entry) {
  const leaderboard = getLeaderboard();
  leaderboard.push(entry);
  leaderboard.sort((a, b) => a.timeSeconds - b.timeSeconds);
  const topScores = leaderboard.slice(0, 10);
  window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(topScores));
  renderLeaderboard(topScores);
}

function renderLeaderboard(entries) {
  const list = document.getElementById('leaderboard-list');
  if (!list) {
    return;
  }
  list.innerHTML = '';
  if (!entries.length) {
    const item = document.createElement('li');
    item.textContent = 'No scores yet.';
    list.appendChild(item);
    return;
  }
  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. ${entry.name} - ${formatTime(entry.timeSeconds)} - ${entry.difficulty} - hints: ${entry.hints}`;
    list.appendChild(item);
  });
}

function showCompletionDialog() {
  const difficultyLabel = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  const timeLabel = formatTime(elapsedSeconds);
  const message = `Congratulations!\n\nCompletion time: ${timeLabel}\nDifficulty: ${difficultyLabel}\nHints used: ${hintCount}`;
  const name = window.prompt('Enter your name for the leaderboard:', 'Player');
  if (name) {
    saveLeaderboard({
      name: name.trim(),
      timeSeconds: elapsedSeconds,
      difficulty: currentDifficulty,
      hints: hintCount
    });
  }
  window.alert(message);
}

function checkCompletion() {
  if (completed) {
    return;
  }

  for (let i = 0; i < SIZE; i += 1) {
    for (let j = 0; j < SIZE; j += 1) {
      if (puzzle[i][j] !== solution[i][j]) {
        return;
      }
    }
  }

  completed = true;
  stopTimer();
  const inputs = document.getElementById('sudoku-board').getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx += 1) {
    inputs[idx].disabled = true;
  }
  showCompletionDialog();
}

function applyTheme(theme) {
  currentTheme = theme;
  document.body.classList.toggle('dark', theme === 'dark');
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function loadTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const theme = storedTheme === 'dark' ? 'dark' : 'light';
  applyTheme(theme);
}

function renderPuzzle(puz, sol = null) {
  puzzle = puz;
  solution = sol || [];
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
        inp.className = 'sudoku-cell prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.className = 'sudoku-cell';
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById('difficulty-select').value;
  currentDifficulty = difficulty;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle, data.solution);
  hintCount = 0;
  completed = false;
  stopTimer();
  startTimer();
  document.getElementById('message').innerText = '';
}

function applyHint() {
  if (solution.length === 0) {
    return;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  let targetIndex = -1;

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (!inp.disabled && inp.value === '') {
      targetIndex = idx;
      break;
    }
  }

  if (targetIndex === -1) {
    return;
  }

  const row = Math.floor(targetIndex / SIZE);
  const col = targetIndex % SIZE;
  const value = solution[row][col];
  const inp = inputs[targetIndex];
  inp.value = value;
  inp.disabled = true;
  inp.className = 'sudoku-cell hinted';
  puzzle[row][col] = value;
  hintCount += 1;
  checkCompletion();
  document.getElementById('message').innerText = `Hint used (${hintCount})`;
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

  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));
  applyCheckHighlights(incorrect);

  if (incorrect.size === 0) {
    stopTimer();
    msg.style.color = '#388e3c';
    msg.innerText = 'No mistakes found!';
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'There are incorrect entries.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  loadTheme();
  renderLeaderboard(getLeaderboard());
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-button').addEventListener('click', applyHint);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
  // initialize
  newGame();
});