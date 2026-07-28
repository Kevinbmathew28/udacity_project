from flask import Flask, render_template, jsonify, request
import sudoku_logic
import random

app = Flask(__name__)

CURRENT = {
    "puzzle": None,
    "solution": None
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/new")
def new_game():
    difficulty = request.args.get("difficulty", "easy").lower()

    if difficulty not in sudoku_logic.DIFFICULTY_LEVELS:
        difficulty = "easy"

    puzzle, solution = sudoku_logic.generate_puzzle(difficulty)

    CURRENT["puzzle"] = puzzle
    CURRENT["solution"] = solution

    return jsonify({
        "difficulty": difficulty,
        "puzzle": puzzle
    })


@app.route("/hint")
def get_hint():
    puzzle = CURRENT["puzzle"]
    solution = CURRENT["solution"]

    if puzzle is None or solution is None:
        return jsonify({"error": "No active game"}), 400

    empty = []

    for r in range(sudoku_logic.SIZE):
        for c in range(sudoku_logic.SIZE):
            if puzzle[r][c] == 0:
                empty.append((r, c))

    if not empty:
        return jsonify({"message": "Puzzle already completed"})

    row, col = random.choice(empty)

    value = solution[row][col]

    puzzle[row][col] = value

    return jsonify({
        "row": row,
        "col": col,
        "value": value
    })


# ---------- NEW ROUTE ----------
@app.route("/validate", methods=["POST"])
def validate_cell():

    if CURRENT["solution"] is None:
        return jsonify({"error": "No active game"}), 400

    data = request.get_json()

    row = int(data["row"])
    col = int(data["col"])
    value = int(data["value"])

    correct = CURRENT["solution"][row][col] == value

    return jsonify({
        "correct": correct
    })


@app.route("/check", methods=["POST"])
def check_solution():

    if CURRENT["solution"] is None:
        return jsonify({"error": "No game in progress"}), 400

    data = request.get_json()

    board = data.get("board", [])

    incorrect = []

    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if board[row][col] != CURRENT["solution"][row][col]:
                incorrect.append([row, col])

    return jsonify({
        "correct": len(incorrect) == 0,
        "incorrect": incorrect
    })


if __name__ == "__main__":
    app.run(debug=True)