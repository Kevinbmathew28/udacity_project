// Client-side rendering and interaction for the Flask-backed Sudoku

const SIZE = 9;
let puzzle = [];

function createBoardElement() {
    const boardDiv = document.getElementById("sudoku-board");
    boardDiv.innerHTML = "";

    for (let i = 0; i < SIZE; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "sudoku-row";

        for (let j = 0; j < SIZE; j++) {
            const input = document.createElement("input");

            input.type = "text";
            input.maxLength = 1;
            input.className = "sudoku-cell";

            input.dataset.row = i;
            input.dataset.col = j;

            input.addEventListener("input", (e) => {
                const value = e.target.value.replace(/[^1-9]/g, "");
                e.target.value = value;
            });

            rowDiv.appendChild(input);
        }

        boardDiv.appendChild(rowDiv);
    }
}

function renderPuzzle(puz) {
    puzzle = puz;

    createBoardElement();

    const inputs = document.querySelectorAll(".sudoku-cell");

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {

            const index = i * SIZE + j;
            const value = puzzle[i][j];
            const input = inputs[index];

            if (value !== 0) {
                input.value = value;
                input.disabled = true;
                input.classList.add("prefilled");
            } else {
                input.value = "";
                input.disabled = false;
            }
        }
    }
}

async function newGame() {

    const difficulty = document.getElementById("difficulty").value;

    const response = await fetch(`/new?difficulty=${difficulty}`);

    const data = await response.json();

    renderPuzzle(data.puzzle);

    document.getElementById("message").innerText = "";
}

async function checkSolution() {

    const inputs = document.querySelectorAll(".sudoku-cell");

    const board = [];

    for (let i = 0; i < SIZE; i++) {

        board[i] = [];

        for (let j = 0; j < SIZE; j++) {

            const index = i * SIZE + j;

            const value = inputs[index].value;

            board[i][j] = value ? parseInt(value) : 0;
        }
    }

    const response = await fetch("/check", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            board: board
        })
    });

    const data = await response.json();

    const message = document.getElementById("message");

    if (data.error) {
        message.style.color = "red";
        message.innerText = data.error;
        return;
    }

    const incorrect = new Set(
        data.incorrect.map(cell => cell[0] * SIZE + cell[1])
    );

    inputs.forEach((input, index) => {

        if (input.disabled)
            return;

        input.className = "sudoku-cell";

        if (incorrect.has(index)) {
            input.classList.add("incorrect");
        }
    });

    if (incorrect.size === 0) {
        message.style.color = "green";
        message.innerText = "Congratulations! Puzzle solved!";
    } else {
        message.style.color = "red";
        message.innerText = "Some cells are incorrect.";
    }
}

window.addEventListener("load", () => {

    document
        .getElementById("new-game")
        .addEventListener("click", newGame);

    document
        .getElementById("check-solution")
        .addEventListener("click", checkSolution);

    newGame();
});