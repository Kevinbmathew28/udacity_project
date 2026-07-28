from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}


def get_clues_for_difficulty(difficulty):
    difficulty_map = {
        'easy': 45,
        'medium': 35,
        'hard': 25,
    }
    if difficulty is None:
        return difficulty_map['medium']
    normalized = difficulty.lower()
    return difficulty_map.get(normalized, difficulty_map['medium'])


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    clue_arg = request.args.get('clues')
    if clue_arg is not None:
        clues = int(clue_arg)
    else:
        clues = get_clues_for_difficulty(request.args.get('difficulty'))
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})


@app.route('/hint', methods=['POST'])
def provide_hint():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] == 0:
                return jsonify({'row': i, 'col': j, 'value': solution[i][j]})

    return jsonify({'error': 'No empty cells left'}), 400


if __name__ == '__main__':
    app.run(debug=True)