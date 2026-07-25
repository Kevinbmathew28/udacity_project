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

    clues = int(request.args.get("clues", 35))

    puzzle, solution = sudoku_logic.generate_puzzle(clues)

    CURRENT["puzzle"] = puzzle
    CURRENT["solution"] = solution

    return jsonify({"puzzle": puzzle})


@app.route("/check", methods=["POST"])
def check_solution():

    data = request.json

    board = data["board"]

    solution = CURRENT["solution"]

    incorrect = []

    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):

            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])

    return jsonify({"incorrect": incorrect})


@app.route("/hint")
def hint():

    puzzle = CURRENT["puzzle"]
    solution = CURRENT["solution"]

    if puzzle is None:
        return jsonify({"error": "No active game"}), 400

    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):

            if puzzle[i][j] == 0:

                puzzle[i][j] = solution[i][j]

                return jsonify({
                    "row": i,
                    "col": j,
                    "value": solution[i][j]
                })

    return jsonify({"error": "Puzzle already complete"}), 400


@app.route("/validate", methods=["POST"])
def validate():

    data = request.json

    row = data["row"]
    col = data["col"]
    value = data["value"]

    solution = CURRENT["solution"]

    return jsonify({
        "correct": solution[row][col] == value
    })


if __name__ == "__main__":
    app.run(debug=True)