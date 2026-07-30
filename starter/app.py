from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}


def json_error(message, status=400):
    response = jsonify({'error': message})
    response.status_code = status
    return response


def validate_board(board):
    if not isinstance(board, list) or len(board) != sudoku_logic.SIZE:
        return False

    for row in board:
        if not isinstance(row, list) or len(row) != sudoku_logic.SIZE:
            return False
        for value in row:
            if not isinstance(value, int) or value < 0 or value > sudoku_logic.SIZE:
                return False
    return True


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    try:
        clues = request.args.get('clues')
        difficulty = request.args.get('difficulty', 'easy')

        if clues is not None:
            try:
                clues = int(clues)
                if clues < 0 or clues > sudoku_logic.SIZE * sudoku_logic.SIZE:
                    raise ValueError
            except ValueError:
                return json_error('Invalid clues parameter. Must be an integer between 0 and 81.', 400)

        if difficulty not in sudoku_logic.DIFFICULTY_SETTINGS:
            return json_error('Invalid difficulty. Must be easy, medium, or hard.', 400)

        puzzle, solution = sudoku_logic.generate_puzzle(clues=clues, difficulty=difficulty)
        CURRENT['puzzle'] = puzzle
        CURRENT['solution'] = solution
        return jsonify({'puzzle': puzzle, 'solution': solution, 'difficulty': difficulty})
    except Exception:
        app.logger.exception('Unexpected error while generating a new game')
        return json_error('Unable to generate a new game.', 500)


@app.route('/check', methods=['POST'])
def check_solution():
    try:
        if not request.is_json:
            return json_error('Request must be JSON.', 400)

        data = request.get_json(silent=True)
        if data is None:
            return json_error('Malformed JSON request body.', 400)

        board = data.get('board')
        if board is None:
            return json_error('Missing board data in request.', 400)

        if not validate_board(board):
            return json_error('Board must be a 9x9 grid of integers between 0 and 9.', 400)

        solution = CURRENT.get('solution')
        if solution is None:
            return json_error('No game in progress.', 400)

        incorrect = []
        for i in range(sudoku_logic.SIZE):
            for j in range(sudoku_logic.SIZE):
                if board[i][j] != solution[i][j]:
                    incorrect.append([i, j])
        return jsonify({'incorrect': incorrect})
    except Exception:
        app.logger.exception('Unexpected error while checking the board')
        return json_error('Unable to validate the board.', 500)

if __name__ == '__main__':
    app.run(debug=True)