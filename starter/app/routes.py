from flask import Blueprint, jsonify, render_template, request, session

from app.sudoku import (
    board_is_complete_and_correct,
    find_incorrect_cells,
    generate_puzzle,
    get_next_hint,
)

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/api/new", methods=["POST"])
def new_game():
    data = request.get_json() or {}
    difficulty = data.get("difficulty", "easy").lower()

    puzzle, solution = generate_puzzle(difficulty)

    fixed = [
        [puzzle[row][col] != 0 for col in range(9)]
        for row in range(9)
    ]

    session["puzzle"] = puzzle
    session["solution"] = solution
    session["fixed"] = fixed
    session["difficulty"] = difficulty

    return jsonify({
        "puzzle": puzzle,
        "fixed": fixed,
        "difficulty": difficulty,
    })


@main_bp.route("/api/validate", methods=["POST"])
def validate_move():
    data = request.get_json() or {}

    row = int(data.get("row"))
    col = int(data.get("col"))
    value = int(data.get("value") or 0)

    solution = session.get("solution")
    fixed = session.get("fixed")

    if solution is None or fixed is None:
        return jsonify({"valid": False, "message": "No active game"}), 400

    if fixed[row]return jsonify({"valid": False, "message": "This cell is locked"})

    if value == 0:
        return jsonify({"valid": True})

    return jsonify({
        "valid": value == solution[row][col]
    })


@main_bp.route("/api/check", methods=["POST"])
def check_board():
    data = request.get_json() or {}
    board = data.get("board")

    solution = session.get("solution")

    if solution is None:
        return jsonify({"message": "No active game"}), 400

    errors = find_incorrect_cells(board, solution)
    solved = board_is_complete_and_correct(board, solution)

    return jsonify({
        "errors": errors,
        "solved": solved,
    })


@main_bp.route("/api/hint", methods=["POST"])
def hint():
    data = request.get_json() or {}
    board = data.get("board")

    solution = session.get("solution")
    fixed = session.get("fixed")

    if solution is None or fixed is None:
        return jsonify({"message": "No active game"}), 400

    next_hint = get_next_hint(board, solution)

    if next_hint is None:
        return jsonify({"hint": None, "message": "No hints available"})

    row = next_hint["row"]
    col = next_hint["col"]

    fixed[row][col] = True
    session["fixed"] = fixed

    return jsonify({
        "hint": next_hint,
        "fixed": fixed,
    })