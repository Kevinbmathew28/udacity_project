// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];

// Timer state
let _timerInterval = null;
let _timerStart = null; // timestamp when timer started
let _elapsedBefore = 0;  // ms accumulated before current run

function _formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function _updateTimerDisplay() {
  const el = document.getElementById('timer');
  if (!el) return;
  const elapsed = (_timerStart ? (Date.now() - _timerStart) : 0) + _elapsedBefore;
  el.innerText = _formatTime(elapsed);
}

function startTimer() {
  if (_timerInterval) clearInterval(_timerInterval);
  _timerStart = Date.now();
  _timerInterval = setInterval(_updateTimerDisplay, 250);
}

function stopTimer() {
  if (_timerInterval) {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }
  if (_timerStart) {
    _elapsedBefore += (Date.now() - _timerStart);
    _timerStart = null;
  }
  _updateTimerDisplay();
}

function resetTimer() {
  if (_timerInterval) {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }
  _timerStart = null;
  _elapsedBefore = 0;
  _updateTimerDisplay();
}

function createBoardElement() {
  const boardDiv = document.createElement('div');
  boardDiv.className = 'sudoku-board-grid';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = r;
      input.dataset.col = c;
      input.size = 1;
      boardDiv.appendChild(input);
    }
  }
  return boardDiv;
}

function renderPuzzle(puz) {
  puzzle = puz;
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';

  const grid = createBoardElement();
  boardDiv.appendChild(grid);

  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i];
    const r = parseInt(inp.dataset.row, 10);
    const c = parseInt(inp.dataset.col, 10);
    const val = puzzle[r][c];
    if (val && val !== 0) {
      inp.value = String(val);
      inp.disabled = true;
      inp.className = 'sudoku-cell prefilled';
    } else {
      inp.value = '';
      inp.disabled = false;
      inp.className = 'sudoku-cell';
    }
  }

  // Reset and start timer when a new puzzle is rendered
  resetTimer();
  startTimer();
}

async function newGame() {
  const res = await fetch('/new');
  const data = await res.json();
  renderPuzzle(data.puzzle);
  const msg = document.getElementById('message');
  if (msg) msg.innerText = '';
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let r = 0; r < SIZE; r++) {
    board.push([]);
    for (let c = 0; c < SIZE; c++) {
      const idx = r * SIZE + c;
      const v = inputs[idx].value;
      board[r].push(v === '' ? 0 : parseInt(v, 10));
    }
  }

  const res = await fetch('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board })
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (!msg) return;

  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }

  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const idx = r * SIZE + c;
      const inp = inputs[idx];
      if (inp.disabled) continue;
      inp.className = 'sudoku-cell';
      if (incorrect.has(idx)) {
        inp.className += ' incorrect';
      } else if (inp.value !== '') {
        // mark as filled (user-entered)
        inp.className += ' filled';
      }
    }
  }

  if (incorrect.size === 0) {
    // Solved!
    stopTimer();
    msg.style.color = '#388e3c';
    const timeStr = document.getElementById('timer') ? document.getElementById('timer').innerText : '';
    msg.innerText = `Congratulations! You solved it in ${timeStr}!`;
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', (e) => { e.preventDefault(); newGame(); });
  document.getElementById('check-solution').addEventListener('click', (e) => { e.preventDefault(); checkSolution(); });
  // initialize timer display
  _updateTimerDisplay();
});
