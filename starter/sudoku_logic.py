import copy
import random

SIZE = 9
EMPTY = 0
DIFFICULTY_SETTINGS = {
    "easy": 45,
    "medium": 35,
    "hard": 25,
}
# Create a deep copy of the Sudoku board to avoid modifying the original board.

def deep_copy(board):
    return copy.deepcopy(board)

# Create an empty 9x9 Sudoku board initialized with EMPTY values.
def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

# Check whether a number can be safely placed in the specified row and column.
def is_safe(board, row, col, num):
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

# Fill the Sudoku board using a recursive backtracking algorithm.
def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

# Remove cells from the completed board while ensuring the puzzle has a unique solution.
def remove_cells(board, clues):
    cells_to_remove = SIZE * SIZE - clues
    attempts = 0
    while cells_to_remove > 0 and attempts < SIZE * SIZE * 2:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        attempts += 1
        if board[row][col] == EMPTY:
            continue

        original = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(deep_copy(board), limit=2) == 1:
            cells_to_remove -= 1
        else:
            board[row][col] = original

# Generate a Sudoku puzzle based on the selected difficulty level.
def generate_puzzle(difficulty="medium"):
    difficulty_name = difficulty.lower()
    if difficulty_name not in DIFFICULTY_SETTINGS:
        raise ValueError("difficulty must be one of: easy, medium, hard")

    clues = DIFFICULTY_SETTINGS[difficulty_name]
    while True:
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        puzzle = deep_copy(board)
        remove_cells(puzzle, clues)
        if sum(cell != EMPTY for row in puzzle for cell in row) == clues:
            return puzzle, solution

# Count the number of valid solutions to verify that the puzzle has a unique solution.
def count_solutions(board, limit=2):
    board = deep_copy(board)

    def search():
        next_empty = None
        for row in range(SIZE):
            for col in range(SIZE):
                if board[row][col] == EMPTY:
                    next_empty = (row, col)
                    break
            if next_empty is not None:
                break

        if next_empty is None:
            return 1

        row, col = next_empty
        solutions = 0
        for candidate in range(1, SIZE + 1):
            if is_safe(board, row, col, candidate):
                board[row][col] = candidate
                solutions += search()
                board[row][col] = EMPTY
                if solutions >= limit:
                    return limit
        return solutions

    return search()
