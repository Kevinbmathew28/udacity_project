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


if __name__ == "__main__":
    app.run(debug=True)
