import copy
import random

SIZE = 9
EMPTY = 0
DIFFICULTY_SETTINGS = {
    'easy': 40,
    'medium': 32,
    'hard': 24,
}


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def find_empty(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None, None


def fill_board(board):
    row, col = find_empty(board)
    if row is None:
        return True

    possible = list(range(1, SIZE + 1))
    random.shuffle(possible)
    for candidate in possible:
        if is_safe(board, row, col, candidate):
            board[row][col] = candidate
            if fill_board(board):
                return True
            board[row][col] = EMPTY
    return False


def count_solutions(board, limit=2):
    board = deep_copy(board)
    return _count_solutions(board, limit)


def _count_solutions(board, limit):
    row, col = find_empty(board)
    if row is None:
        return 1

    solutions = 0
    for candidate in range(1, SIZE + 1):
        if is_safe(board, row, col, candidate):
            board[row][col] = candidate
            solutions += _count_solutions(board, limit)
            board[row][col] = EMPTY
            if solutions >= limit:
                return solutions
    return solutions


def remove_cells(board, clues):
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)
    attempts = SIZE * SIZE - clues
    removed = 0

    for row, col in positions:
        if removed >= attempts:
            break
        if board[row][col] == EMPTY:
            continue

        value = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(board) != 1:
            board[row][col] = value
        else:
            removed += 1


def get_clues_for_difficulty(difficulty='easy'):
    normalized = (difficulty or 'easy').lower()
    return DIFFICULTY_SETTINGS.get(normalized, DIFFICULTY_SETTINGS['easy'])


def generate_puzzle(clues=35, difficulty='easy'):
    if clues is None:
        clues = get_clues_for_difficulty(difficulty)

    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)

    puzzle = deep_copy(board)
    remove_cells(puzzle, clues)

    if count_solutions(puzzle) != 1:
        return generate_puzzle(clues=clues, difficulty=difficulty)

    return puzzle, solution
