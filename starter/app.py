"""
Flask Sudoku Application

This file contains the Flask routes that power the Sudoku game.
It handles puzzle generation, solution checking, hints,
real-time validation and communication with the frontend.
"""

from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Stores the current puzzle and its solution in memory.
CURRENT = {
    "puzzle": None,
    "solution": None
}


@app.route("/")
def index():
    """
    Render the main Sudoku game page.
    """
    return render_template("index.html")


@app.route("/new")
def new_game():
    """
    Generate a new Sudoku puzzle.

    Query Parameters:
        clues (int): Number of visible cells.

    Returns:
        JSON response containing the generated puzzle.
    """
    try:
        clues = int(request.args.get("clues", 35))

        if clues < 20 or clues > 60:
            return jsonify({"error": "Clues must be between 20 and 60."}), 400

        puzzle, solution = sudoku_logic.generate_puzzle(clues)

        CURRENT["puzzle"] = puzzle
        CURRENT["solution"] = solution

        return jsonify({"puzzle": puzzle})

    except ValueError:
        return jsonify({"error": "Invalid clues value."}), 400

    except Exception as error:
        print(f"Error generating puzzle: {error}")
        return jsonify({"error": "Unable to generate puzzle."}), 500


@app.route("/check", methods=["POST"])
def check_solution():
    """
    Compare the player's board with the solution.

    Returns:
        List of incorrect cell coordinates.
    """
    try:
        data = request.get_json()

        if not data or "board" not in data:
            return jsonify({"error": "Board data is missing."}), 400

        board = data["board"]

        solution = CURRENT.get("solution")

        if solution is None:
            return jsonify({"error": "No active game."}), 400

        incorrect = []

        for i in range(sudoku_logic.SIZE):
            for j in range(sudoku_logic.SIZE):
                if board[i][j] != solution[i][j]:
                    incorrect.append([i, j])

        return jsonify({"incorrect": incorrect})

    except Exception as error:
        print(f"Check error: {error}")
        return jsonify({"error": "Unable to check solution."}), 500


@app.route("/hint")
def hint():
    """
    Reveal one correct cell and lock it.

    Returns:
        JSON containing row, column and value.
    """
    try:
        puzzle = CURRENT.get("puzzle")
        solution = CURRENT.get("solution")

        if puzzle is None or solution is None:
            return jsonify({"error": "No active game."}), 400

        for i in range(sudoku_logic.SIZE):
            for j in range(sudoku_logic.SIZE):

                if puzzle[i][j] == 0:
                    puzzle[i][j] = solution[i][j]

                    return jsonify({
                        "row": i,
                        "col": j,
                        "value": solution[i][j]
                    })

        return jsonify({"error": "Puzzle already complete."}), 400

    except Exception as error:
        print(f"Hint error: {error}")
        return jsonify({"error": "Unable to generate hint."}), 500


@app.route("/validate", methods=["POST"])
def validate():
    """
    Validate a single Sudoku cell.

    Returns:
        JSON indicating whether the entered value is correct.
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Missing request data."}), 400

        row = data.get("row")
        col = data.get("col")
        value = data.get("value")

        solution = CURRENT.get("solution")

        if solution is None:
            return jsonify({"error": "No active game."}), 400

        return jsonify({
            "correct": solution[row][col] == value
        })

    except Exception as error:
        print(f"Validation error: {error}")
        return jsonify({"error": "Validation failed."}), 500


if __name__ == "__main__":
    app.run(debug=True)