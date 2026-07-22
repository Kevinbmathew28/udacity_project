const boardElement = document.getElementById("board");
const difficultyElement = document.getElementById("difficulty");
const newGameButton = document.getElementById("newGameButton");
const hintButton = document.getElementById("hintButton");
const checkButton = document.getElementById("checkButton");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");
const scoreListElement = document.getElementById("scoreList");
const darkModeToggle = document.getElementById("darkModeToggle");
const clearScoresButton = document.getElementById("clearScoresButton");

let currentBoard = [];
let fixedCells = [];
let timerInterval = null;
let secondsElapsed = 0;
let currentDifficulty = "easy";

function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function startTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    timerElement.textContent = "00:00";

    timerInterval = setInterval(() => {
        secondsElapsed += 1;
        timerElement.textContent = formatTime(secondsElapsed);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function getBoxClass(row, col) {
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    return (boxRow + boxCol) % 2 === 0 ? "alt-box" : "";
}

function renderBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            const input = document.createElement("input");

            input.type = "text";
            input.inputMode = "numeric";
            input.maxLength = 1;
            input.className = `cell ${getBoxClass(row, col)}`;
            input.dataset.row = row;
            input.dataset.col = col;
            input.setAttribute("aria-label", `Row ${row + 1}, Column ${col + 1}`);

            const value = currentBoard[row][col];

            if (value !== 0) {
                input.value = value;
            }

            if (fixedCells[row][col]) {
                input.disabled = true;
                input.classList.add("fixed");
            } else {
                input.addEventListener("input", handleCellInput);
            }

            boardElement.appendChild(input);
        }
    }
}

async function handleCellInput(event) {
    const input = event.target;
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const rawValue = input.value.trim();

    input.classList.remove("invalid");

    if (!/^[1-9]?$/.test(rawValue)) {
        input.value = "";
        currentBoard[row][col] = 0;
        return;
    }

    const value = rawValue === "" ? 0 : Number(rawValue);
    currentBoard[row][col] = value;

    const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ row, col, value }),
    });

    const result = await response.json();

    if (!result.valid) {
        input.classList.add("invalid");
        messageElement.textContent = "Invalid move highlighted.";
    } else {
        messageElement.textContent = "";
    }
}

async function startNewGame() {
    currentDifficulty = difficultyElement.value;

    const response = await fetch("/api/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ difficulty: currentDifficulty }),
    });

    const data = await response.json();

    currentBoard = data.puzzle;
    fixedCells = data.fixed;
    messageElement.textContent = "";
    renderBoard();
    startTimer();
}

function getBoardFromInputs() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    const cells = document.querySelectorAll(".cell");

    cells.forEach((cell) => {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const value = cell.value.trim();

        board[row][col] = value === "" ? 0 : Number(value);
    });

    return board;
}

function markErrors(errors) {
    document.querySelectorAll(".cell").forEach((cell) => {
        cell.classList.remove("invalid");
    });

    errors.forEach((error) => {
        const selector = `.cell[data-row="${error.row}"][data-col="${error.col}"]`;
        const cell = document.querySelector(selector);

        if (cell) {
            cell.classList.add("invalid");
        }
    });
}

async function checkBoard() {
    currentBoard = getBoardFromInputs();

    const response = await fetch("/api/check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ board: currentBoard }),
    });

    const result = await response.json();

    markErrors(result.errors);

    if (result.solved) {
        stopTimer();
        messageElement.textContent = "Congratulations! Puzzle solved correctly.";
        saveScore();
        renderScores();
    } else if (result.errors.length > 0) {
        messageElement.textContent = "Some entries are incorrect.";
    } else {
        messageElement.textContent = "No incorrect entries found. Keep going!";
    }
}

async function getHint() {
    currentBoard = getBoardFromInputs();

    const response = await fetch("/api/hint", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ board: currentBoard }),
    });

    const data = await response.json();

    if (!data.hint) {
        messageElement.textContent = "No hints available.";
        return;
    }

    const { row, col, value } = data.hint;
    const selector = `.cell[data-row="${row}"][data-col="${col}"]`;
    const cell = document.querySelector(selector);

    currentBoard[row][col] = value;
    fixedCells = data.fixed;

    if (cell) {
        cell.value = value;
        cell.disabled = true;
        cell.classList.remove("invalid");
        cell.classList.add("hint");
    }

    messageElement.textContent = "Hint added and locked.";
}

function getScores() {
    return JSON.parse(localStorage.getItem("sudokuTop10Scores") || "[]");
}

function saveScore() {
    const name = prompt("Enter your name for the scoreboard:", "Player") || "Player";

    const scores = getScores();

    scores.push({
        name,
        seconds: secondsElapsed,
        time: formatTime(secondsElapsed),
        difficulty: currentDifficulty,
        date: new Date().toLocaleDateString(),
    });

    scores.sort((a, b) => a.seconds - b.seconds);

    localStorage.setItem(
        "sudokuTop10Scores",
        JSON.stringify(scores.slice(0, 10))
    );
}

function renderScores() {
    const scores = getScores();
    scoreListElement.innerHTML = "";

    scores.forEach((score) => {
        const item = document.createElement("li");
        item.textContent = `${score.name} - ${score.time} - ${score.difficulty}`;
        scoreListElement.appendChild(item);
    });
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "sudokuDarkMode",
        document.body.classList.contains("dark") ? "true" : "false"
    );
}

function loadDarkModePreference() {
    const enabled = localStorage.getItem("sudokuDarkMode") === "true";

    if (enabled) {
        document.body.classList.add("dark");
    }
}

function clearScores() {
    localStorage.removeItem("sudokuTop10Scores");
    renderScores();
}

newGameButton.addEventListener("click", startNewGame);
checkButton.addEventListener("click", checkBoard);
hintButton.addEventListener("click", getHint);
darkModeToggle.addEventListener("click", toggleDarkMode);
clearScoresButton.addEventListener("click", clearScores);

loadDarkModePreference();
renderScores();
startNewGame();