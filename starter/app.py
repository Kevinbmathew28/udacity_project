from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, render_template, request

import sudoku_logic

Board = List[List[int]]

app: Flask = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution.
CURRENT: Dict[str, Optional[Board]] = {
    "puzzle": None,
    "solution": None,
}


@app.route("/")
def index() -> str:
    """Render the main Sudoku page."""
    return render_template("index.html")


@app.route("/new")
def new_game() -> Any:
    """Generate a new puzzle and store it as the active game."""
    clues = int(request.args.get("clues", 35))
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT["puzzle"] = puzzle
    CURRENT["solution"] = solution
    return jsonify({"puzzle": puzzle})


@app.route("/check", methods=["POST"])
def check_solution() -> Any:
    """Compare the submitted board with the active solution."""
    data = request.json
    board = data.get("board")
    solution = CURRENT.get("solution")

    if solution is None:
        return jsonify({"error": "No game in progress"}), 400

    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])

    return jsonify({"incorrect": incorrect})


@app.route("/hint", methods=["POST"])
def hint() -> Any:
    """Reveal the solution value for the first empty cell in the puzzle."""
    puzzle = CURRENT.get("puzzle")
    solution = CURRENT.get("solution")

    if puzzle is None or solution is None:
        return jsonify({"error": "No game in progress"}), 400

    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if puzzle[row][col] == 0:
                puzzle[row][col] = solution[row][col]
                return jsonify({
                    "row": row,
                    "col": col,
                    "value": solution[row][col],
                })

    return jsonify({"message": "Puzzle already complete"})


@app.route("/validate", methods=["POST"])
def validate() -> Any:
    """Validate a single cell against the active solution."""
    data = request.json
    row = data.get("row")
    col = data.get("col")
    value = data.get("value")
    solution = CURRENT.get("solution")

    if solution is None:
        return jsonify({"error": "No game in progress"}), 400

    return jsonify({"correct": solution[row][col] == value})


if __name__ == "__main__":
    app.run(debug=True)
