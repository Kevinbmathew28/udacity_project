const SIZE = 9;
let puzzle = [];

function createBoardElement() {
    const board = document.getElementById("sudoku-board");
    board.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {

        const rowDiv = document.createElement("div");
        rowDiv.className = "sudoku-row";

        for (let col = 0; col < SIZE; col++) {

            const input = document.createElement("input");

            input.type = "text";
            input.maxLength = 1;
            input.className = "sudoku-cell";

            input.dataset.row = row;
            input.dataset.col = col;

            input.addEventListener("input", function (e) {
                e.target.value = e.target.value.replace(/[^1-9]/g, "");
            });

            rowDiv.appendChild(input);
        }

        board.appendChild(rowDiv);
    }
}

function renderPuzzle(board) {

    puzzle = board;

    createBoardElement();

    const cells = document.querySelectorAll(".sudoku-cell");

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const index = row * SIZE + col;

            if (board[row][col] !== 0) {

                cells[index].value = board[row][col];
                cells[index].disabled = true;
                cells[index].classList.add("prefilled");

            } else {

                cells[index].value = "";
                cells[index].disabled = false;
            }
        }
    }
}

async function newGame() {

    const difficulty =
        document.getElementById("difficulty").value;

    const response =
        await fetch(`/new?difficulty=${difficulty}`);

    const data = await response.json();

    renderPuzzle(data.puzzle);

    document.getElementById("message").innerText = "";
}

async function hint() {

    const response = await fetch("/hint");

    const data = await response.json();

    if (data.error) {

        document.getElementById("message").innerText =
            data.error;

        return;
    }

    const cells =
        document.querySelectorAll(".sudoku-cell");

    const index =
        data.row * SIZE + data.col;

    cells[index].value = data.value;
    cells[index].disabled = true;
    cells[index].classList.add("prefilled");
}

async function checkSolution() {

    const cells =
        document.querySelectorAll(".sudoku-cell");

    const board = [];

    for (let row = 0; row < SIZE; row++) {

        board[row] = [];

        for (let col = 0; col < SIZE; col++) {

            const index = row * SIZE + col;

            board[row][col] =
                cells[index].value === ""
                    ? 0
                    : parseInt(cells[index].value);
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

    const message =
        document.getElementById("message");

    if (data.error) {

        message.style.color = "red";
        message.innerText = data.error;

        return;
    }

    const incorrect =
        new Set(
            data.incorrect.map(
                cell => cell[0] * SIZE + cell[1]
            )
        );

    cells.forEach((cell, index) => {

        if (cell.disabled)
            return;

        cell.className = "sudoku-cell";

        if (incorrect.has(index)) {

            cell.classList.add("incorrect");
        }

    });

    if (incorrect.size === 0) {

        message.style.color = "green";
        message.innerText =
            "Congratulations! You solved the puzzle!";

    } else {

        message.style.color = "red";
        message.innerText =
            "Some cells are incorrect.";

    }
}

window.onload = function () {

    document
        .getElementById("new-game")
        .addEventListener("click", newGame);

    document
        .getElementById("hint")
        .addEventListener("click", hint);

    document
        .getElementById("check-solution")
        .addEventListener("click", checkSolution);

    newGame();
};