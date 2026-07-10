"""Flask application for the Sudoku starter project."""

from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, render_template, request

import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for the current puzzle and solution.
CURRENT: Dict[str, Optional[List[List[int]]]] = {
    "puzzle": None,
    "solution": None,
}


@app.route("/")
def index() -> str:
    """Render the main Sudoku page."""
    return render_template("index.html")


@app.route("/new")
def new_game() -> Any:
    """Generate a new Sudoku puzzle and store it as the current game."""
    clues = int(request.args.get("clues", 35))
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT["puzzle"] = puzzle
    CURRENT["solution"] = solution
    return jsonify({"puzzle": puzzle})


@app.route("/check", methods=["POST"])
def check_solution() -> Any:
    """Return the coordinates of incorrect values compared to the solution."""
    data = request.get_json()
    board = data.get("board")
    solution = CURRENT.get("solution")

    if solution is None:
        return jsonify({"error": "No game in progress"}), 400

    incorrect: List[List[int]] = []
    for row_index in range(sudoku_logic.SIZE):
        for col_index in range(sudoku_logic.SIZE):
            if board[row_index][col_index] != solution[row_index][col_index]:
                incorrect.append([row_index, col_index])

    return jsonify({"incorrect": incorrect})


@app.route("/hint", methods=["POST"])
def get_hint() -> Any:
    """Fill the first empty cell with the correct solution value."""
    puzzle = CURRENT.get("puzzle")
    solution = CURRENT.get("solution")

    if puzzle is None or solution is None:
        return jsonify({"error": "No game in progress"}), 400

    for row_index in range(sudoku_logic.SIZE):
        for col_index in range(sudoku_logic.SIZE):
            if puzzle[row_index][col_index] == sudoku_logic.EMPTY:
                value = solution[row_index][col_index]
                puzzle[row_index][col_index] = value
                CURRENT["puzzle"] = puzzle
                return jsonify({
                    "row": row_index,
                    "col": col_index,
                    "value": value,
                })

    return jsonify({"message": "Puzzle already complete"})


if __name__ == "__main__":
    app.run(debug=True)
