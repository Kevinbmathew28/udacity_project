from flask import Blueprint, jsonify, render_template, request

from generator import generate_puzzle
from validator import find_incorrect_cells

bp = Blueprint('main', __name__)

CURRENT = None


def set_current_store(store):
    global CURRENT
    CURRENT = store


@bp.route('/')
def index():
    return render_template('index.html')


@bp.route('/new')
def new_game():
    difficulty = request.args.get('difficulty', '').lower()
    clues = request.args.get('clues')

    if clues is None:
        clue_map = {
            'easy': 45,
            'medium': 35,
            'hard': 25,
        }
        clues = clue_map.get(difficulty, 35)
    else:
        clues = int(clues)

    puzzle, solution = generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle, 'solution': solution})


@bp.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    incorrect = find_incorrect_cells(board, solution)
    return jsonify({'incorrect': incorrect})
