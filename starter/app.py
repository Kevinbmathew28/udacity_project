from flask import Flask, render_template, jsonify, request
import sudoku_logic

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