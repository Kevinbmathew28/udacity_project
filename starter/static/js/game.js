let puzzle = [];
let solution = [];
let currentBoard = [];
let difficulty = "easy";
let timerInterval = null;
let secondsElapsed = 0;

const boardElement = document.getElementById("board");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");
const difficultyElement = document.getElementById("difficulty");
const scoreListElement = document.getElementById("score-list");

document.getElementById("new-game").addEventListener("click", startNewGame);
document.getElementById("hint").addEventListener("click", giveHint);
document.getElementById("check").addEventListener("click", checkBoard);
document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

async function startNewGame() {
    difficulty = difficultyElement.value;

    try {
        const response = await fetch(`/api/new-game?difficulty=${difficulty}`);

        if (!response.ok) {
            throw new Error("Failed to load new puzzle");
        }

        const data = await response.json();

        puzzle = data.puzzle;
        solution = data.solution;
        currentBoard = puzzle.map(row => [...row]);

        messageElement.textContent = "";
        secondsElapsed = 0;
        timerElement.textContent = "00:00";

        startTimer();
        renderBoard();
        loadScores();
    } catch (error) {
        console.error(error);
        messageElement.textContent = "Error loading Sudoku puzzle. Please check Flask API.";
    }
}

function renderBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const input = document.createElement("input");

            input.type = "text";
            input.maxLength = 1;
            input.className = "cell";
            input.dataset.row = row;
            input.dataset.col = col;

            const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
            input.classList.add(boxIndex % 2 === 0 ? "box-light" : "box-dark");

            if (puzzle[row][col] !== 0) {
                input.value = puzzle[row][col];
                input.disabled = true;
                input.classList.add("prefilled");
            }

            input.addEventListener("input", handleInput);

            boardElement.appendChild(input);
        }
    }
}

function handleInput(event) {
    const input = event.target;
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const value = Number(input.value);

    input.classList.remove("invalid", "valid");

    if (!value || value < 1 || value > 9) {
        currentBoard[row][col] = 0;
        input.value = "";
        return;
    }

    currentBoard[row][col] = value;

    if (value !== solution[row][col]) {
        input.classList.add("invalid");
    } else {
        input.classList.add("valid");
    }

    if (isSolved()) {
        completeGame();
    }
}

function giveHint() {
    const availableCells = [];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (currentBoard[row][col] !== solution[row][col]) {
                availableCells.push({ row, col });
            }
        }
    }

    if (availableCells.length === 0) {
        return;
    }

    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];

    currentBoard[randomCell.row][randomCell.col] =
        solution[randomCell.row][randomCell.col];

    renderBoard();

    const selector = `input[data-row="${randomCell.row}"][data-col="${randomCell.col}"]`;
    const input = document.querySelector(selector);

    input.value = solution[randomCell.row][randomCell.col];
    input.disabled = true;
    input.classList.add("hinted");
}

function checkBoard() {
    const inputs = document.querySelectorAll(".cell");

    inputs.forEach(input => {
        const row = Number(input.dataset.row);
        const col = Number(input.dataset.col);
        const value = Number(input.value);

        input.classList.remove("invalid", "valid");

        if (!input.disabled && value) {
            if (value !== solution[row][col]) {
                input.classList.add("invalid");
            } else {
                input.classList.add("valid");
            }
        }
    });
}

function isSolved() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (currentBoard[row][col] !== solution[row][col]) {
                return false;
            }
        }
    }

    return true;
}

function completeGame() {
    clearInterval(timerInterval);

    messageElement.textContent = "Congratulations! You solved the puzzle correctly.";

    const playerName = prompt("Enter your name for the scoreboard:");

    if (playerName) {
        saveScore(playerName, secondsElapsed, difficulty);
        loadScores();
    }
}

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        secondsElapsed++;
        timerElement.textContent = formatTime(secondsElapsed);
    }, 1000);
}

function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
}

function saveScore(name, time, difficulty) {
    const scores = JSON.parse(localStorage.getItem("sudokuScores")) || [];

    scores.push({
        name,
        time,
        difficulty,
        displayTime: formatTime(time)
    });

    scores.sort((a, b) => a.time - b.time);

    const topTen = scores.slice(0, 10);

    localStorage.setItem("sudokuScores", JSON.stringify(topTen));
}

function loadScores() {
    const scores = JSON.parse(localStorage.getItem("sudokuScores")) || [];

    scoreListElement.innerHTML = "";

    scores.forEach(score => {
        const item = document.createElement("li");
        item.textContent = `${score.name} - ${score.displayTime} - ${score.difficulty}`;
        scoreListElement.appendChild(item);
    });
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

startNewGame();
console.log("GAME JS LOADED");
