from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)
# Store the current game state, including the puzzle, solution, and difficulty.
CURRENT = {
    'puzzle': None,
    'solution': None,
    'difficulty': 'medium',
}
# Render the main Sudoku game page.
@app.route('/')
def index():
    return render_template('index.html')

# Start a new Sudoku game using the selected difficulty
@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty', 'medium').lower()
    puzzle, solution = sudoku_logic.generate_puzzle(difficulty=difficulty)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = difficulty
    return jsonify({'puzzle': puzzle, 'difficulty': difficulty})

# Compare the player's board with the correct solution
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

# Return one valid hint for an empty cell
@app.route('/hint', methods=['POST'])
def get_hint():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    current_puzzle = CURRENT.get('puzzle')

    if solution is None or current_puzzle is None:
        return jsonify({'error': 'No game in progress'}), 400

    board_to_update = current_puzzle if board is None else board
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board_to_update[i][j] == 0:
                value = solution[i][j]
                board_to_update[i][j] = value
                CURRENT['puzzle'] = board_to_update
                return jsonify({'row': i, 'col': j, 'value': value})

    return jsonify({'error': 'No empty cells left'}), 400

if __name__ == '__main__':
    app.run(debug=True)