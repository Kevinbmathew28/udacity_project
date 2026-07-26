const board = document.getElementById("sudoku-board");
const message = document.getElementById("message");
const timerElement = document.getElementById("timer");

let currentBoard = [];
let seconds = 0;
let timer = null;

// ---------- TIMER ----------

function startTimer() {
    clearInterval(timer);

    seconds = 0;

    timer = setInterval(() => {

        seconds++;

        let mins = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");

        let secs = (seconds % 60)
            .toString()
            .padStart(2, "0");

        timerElement.textContent = `${mins}:${secs}`;

    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

// ---------- BOARD ----------

function renderBoard(puzzle) {

    currentBoard = JSON.parse(JSON.stringify(puzzle));

    board.innerHTML = "";

    for (let i = 0; i < 9; i++) {

        const row = document.createElement("div");
        row.className = "sudoku-row";

        for (let j = 0; j < 9; j++) {

            const input = document.createElement("input");

            input.type = "number";

            input.min = 1;
            input.max = 9;

            input.className = "sudoku-cell";

            input.dataset.row = i;
            input.dataset.col = j;

            if (puzzle[i][j] !== 0) {

                input.value = puzzle[i][j];
                input.readOnly = true;
                input.classList.add("prefilled");

            }

            input.addEventListener("input", () => {

                let value = parseInt(input.value);

                if (isNaN(value)) {

                    currentBoard[i][j] = 0;

                } else {

                    currentBoard[i][j] = value;

                }

                input.classList.remove("incorrect");

            });

            row.appendChild(input);

        }

        board.appendChild(row);

    }

}

// ---------- NEW GAME ----------

async function newGame() {

    const clues =
        document.getElementById("difficulty").value;

    const response =
        await fetch(`/new?clues=${clues}`);

    const data =
        await response.json();

    renderBoard(data.puzzle);

    message.textContent = "";

    startTimer();

}

document
.getElementById("new-game")
.addEventListener("click", newGame);

// ---------- CHECK ----------

async function checkBoard() {

    document.querySelectorAll(".incorrect")
        .forEach(c => c.classList.remove("incorrect"));

    const response = await fetch("/check", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            board: currentBoard

        })

    });

    const data = await response.json();

    if (data.incorrect.length === 0) {

        stopTimer();

        message.textContent =
            "🎉 Congratulations! Puzzle Solved.";

        saveScore();

    } else {

        message.textContent =
            `❌ ${data.incorrect.length} incorrect cell(s).`;

        data.incorrect.forEach(cell => {

            const selector =
                `.sudoku-cell[data-row="${cell[0]}"][data-col="${cell[1]}"]`;

            document
                .querySelector(selector)
                .classList.add("incorrect");

        });

    }

}

document
.getElementById("check-solution")
.addEventListener("click", checkBoard);

// ---------- HINT ----------

document
.getElementById("hint-btn")
.addEventListener("click", async () => {

    try{

        const response =
            await fetch("/hint");

        if(!response.ok){

            alert("Hint backend not added yet.");

            return;

        }

        const hint =
            await response.json();

        currentBoard[hint.row][hint.col] =
            hint.value;

        const selector =
            `.sudoku-cell[data-row="${hint.row}"][data-col="${hint.col}"]`;

        const cell =
            document.querySelector(selector);

        cell.value = hint.value;

        cell.readOnly = true;

        cell.classList.add("prefilled");

    }

    catch{

        alert("Hint backend not implemented.");

    }

});

// ---------- DARK MODE ----------

const themeBtn =
document.getElementById("theme-toggle");

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        themeBtn.innerHTML="☀️ Light Mode";

    }else{

        themeBtn.innerHTML="🌙 Dark Mode";

    }

});

// ---------- SCOREBOARD ----------

function saveScore(){

    let scores =
        JSON.parse(localStorage.getItem("scores")) || [];

    const name =
        prompt("Enter your name");

    scores.push({

        name:name || "Anonymous",

        difficulty:
        document.getElementById("difficulty")
        .selectedOptions[0].text,

        time:seconds

    });

    scores.sort((a,b)=>a.time-b.time);

    scores=scores.slice(0,10);

    localStorage.setItem("scores",
    JSON.stringify(scores));

    loadScores();

}


function loadScores(){

    const body=
    document.getElementById("leaderboard-body");

    body.innerHTML="";

    let scores=
    JSON.parse(localStorage.getItem("scores")) || [];

    scores.forEach((score,index)=>{

        const row=document.createElement("tr");

        const mins=Math.floor(score.time/60)
        .toString()
        .padStart(2,"0");

        const secs=(score.time%60)
        .toString()
        .padStart(2,"0");

        row.innerHTML=`

            <td>${index+1}</td>

            <td>${score.name}</td>

            <td>${score.difficulty}</td>

            <td>${mins}:${secs}</td>

        `;

        body.appendChild(row);

    });

}

// ---------- START ----------

window.onload=()=>{

    loadScores();

    newGame();

};
const playerNameInput = document.getElementById("player-name");