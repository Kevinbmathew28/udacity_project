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

function _isDigitOneToNine(ch) {
  const n = parseInt(ch, 10);
  return !Number.isNaN(n) && n >= 1 && n <= 9;
}

function validateBoardConflicts() {
  // Build maps of seen values to list of input indices per row/col/box
  const boardDiv = document.getElementById('sudoku-board');
  if (!boardDiv) return;
  const inputs = boardDiv.getElementsByTagName('input');

  // structures: rowVals[row][value] = [indices]
  const rowVals = Array.from({ length: SIZE }, () => ({}));
  const colVals = Array.from({ length: SIZE }, () => ({}));
  const boxVals = Array.from({ length: SIZE }, () => ({}));

  // first pass: collect values and mark syntactic invalids
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue; // prefilled cells are assumed valid
    const r = parseInt(inp.dataset.row, 10);
    const c = parseInt(inp.dataset.col, 10);
    const val = inp.value.trim();

    // reset classes except prefilled
    inp.classList.remove('invalid');
    inp.classList.remove('conflict');

    if (val === '') continue;
    if (!_isDigitOneToNine(val)) {
      // syntactic invalid (not 1-9)
      inp.classList.add('invalid');
      continue;
    }
    const n = val;
    // row
    rowVals[r][n] = rowVals[r][n] || [];
    rowVals[r][n].push(idx);
    // col
    colVals[c][n] = colVals[c][n] || [];
    colVals[c][n].push(idx);
    // box index
    const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    boxVals[boxIndex][n] = boxVals[boxIndex][n] || [];
    boxVals[boxIndex][n].push(idx);
  }

  // second pass: mark duplicates in row/col/box as conflict
  function markConflicts(map) {
    for (let i = 0; i < map.length; i++) {
      const m = map[i];
      Object.keys(m).forEach((val) => {
        if (m[val].length > 1) {
          m[val].forEach(idx => inputs[idx].classList.add('conflict'));
        }
      });
    }
  }

  markConflicts(rowVals);
  markConflicts(colVals);
  markConflicts(boxVals);
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
      // add live validation listener for user inputs
      inp.addEventListener('input', () => {
        // sanitize: allow only digits 1-9, strip other chars
        if (inp.value && !/^[1-9]$/.test(inp.value)) {
          // keep only the first digit 1-9 if present
          const m = inp.value.match(/[1-9]/);
          inp.value = m ? m[0] : '';
        }
        validateBoardConflicts();
      });
      // optional: validate on blur as well
      inp.addEventListener('blur', () => validateBoardConflicts());
    }
  }

  // Reset and start timer when a new puzzle is rendered
  resetTimer();
  startTimer();

  // initial validation pass (no conflicts for fresh puzzle)
  validateBoardConflicts();
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
      inp.classList.remove('incorrect');
      inp.classList.remove('filled');
      if (incorrect.has(idx)) {
        inp.classList.add('incorrect');
      } else if (inp.value !== '') {
        // mark as filled (user-entered)
        inp.classList.add('filled');
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

  // run conflict validation to clear any conflict markers now that server flagged incorrect cells
  validateBoardConflicts();
}

async function checkPuzzle() {
  // similar to checkSolution but only highlights incorrect cells and leaves correct entries untouched
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

  // remove previous incorrect highlights
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove('incorrect');
  }

  const incorrect = data.incorrect || [];
  incorrect.forEach(([r, c]) => {
    const idx = r * SIZE + c;
    const inp = inputs[idx];
    if (inp && !inp.disabled) inp.classList.add('incorrect');
  });

  // update message but do not stop timer or mark correct cells
  if (incorrect.length === 0) {
    msg.style.color = '#388e3c';
    msg.innerText = 'No incorrect cells found.';
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = `${incorrect.length} incorrect cell(s) highlighted.`;
  }
}

// Wire buttons
window.addEventListener('load', () => {
  const ng = document.getElementById('new-game');
  if (ng) ng.addEventListener('click', (e) => { e.preventDefault(); newGame(); });
  const cs = document.getElementById('check-solution');
  if (cs) cs.addEventListener('click', (e) => { e.preventDefault(); checkSolution(); });
  const cp = document.getElementById('check-puzzle');
  if (cp) cp.addEventListener('click', (e) => { e.preventDefault(); checkPuzzle(); });
  // initialize timer display
  _updateTimerDisplay();
});
