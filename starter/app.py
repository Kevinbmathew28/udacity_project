from flask import Flask, render_template, jsonify, request
import random
from sudoku import logic as sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None,
    'difficulty': None,
    'clues': None,
}

# Difficulty presets (number of clues prefilled)
DIFFICULTY_MAP = {
    'easy': 45,    # most clues
    'medium': 35,
    'hard': 25,    # fewest clues
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    # Accept either an explicit number of clues or a difficulty name
    clues_param = request.args.get('clues')
    difficulty = request.args.get('difficulty')

    if clues_param is not None:
        try:
            clues = int(clues_param)
        except ValueError:
            return jsonify({'error': 'Invalid clues parameter'}), 400
    elif difficulty:
        difficulty = difficulty.lower()
        if difficulty not in DIFFICULTY_MAP:
            return jsonify({'error': 'Unknown difficulty; use easy, medium, or hard'}), 400
        clues = DIFFICULTY_MAP[difficulty]
    else:
        # default
        difficulty = 'medium'
        clues = DIFFICULTY_MAP[difficulty]

    # Generate puzzle and store solution
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = difficulty
    CURRENT['clues'] = clues

    return jsonify({'puzzle': puzzle, 'difficulty': difficulty, 'clues': clues})

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    if board is None:
        return jsonify({'error': 'No board provided'}), 400

    incorrect = []
    # iterate by solution dimensions to be robust
    for i in range(len(solution)):
        for j in range(len(solution[0])):
            # accept ints or strings; normalize to int
            try:
                bval = int(board[i][j])
            except Exception:
                bval = None
            if bval != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})

@app.route('/hint')
def hint():
    """Provide a single correct hint: fill one of the empty cells and lock it."""
    puzzle = CURRENT.get('puzzle')
    solution = CURRENT.get('solution')
    if puzzle is None or solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    # find empty cells
    empties = [(r, c) for r in range(len(puzzle)) for c in range(len(puzzle[0])) if puzzle[r][c] == 0]
    if not empties:
        return jsonify({'error': 'No empty cells remaining'}), 400

    r, c = random.choice(empties)
    val = solution[r][c]
    # update stored puzzle so future hints don't repeat same cell
    CURRENT['puzzle'][r][c] = val
    return jsonify({'row': r, 'col': c, 'value': val})

if __name__ == '__main__':
    app.run(debug=True)
