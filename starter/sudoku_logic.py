import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    """Return a deep copy of the Sudoku board."""
    return copy.deepcopy(board)


def create_empty_board():
    """Create an empty 9x9 Sudoku board."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    """Check whether a number can be placed safely."""

    for x in range(SIZE):
        if board[row][x] == num:
            return False
        if board[x][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3

    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False

    return True


def fill_board(board):
    """Generate a complete solved Sudoku using recursive backtracking."""

    for row in range(SIZE):
        for col in range(SIZE):

            if board[row][col] == EMPTY:

                nums = list(range(1, 10))
                random.shuffle(nums)

                for num in nums:

                    if is_safe(board, row, col, num):

                        board[row][col] = num

                        if fill_board(board):
                            return True

                        board[row][col] = EMPTY

                return False

    return True


def find_empty(board):
    """Return the next empty cell."""

    for i in range(SIZE):
        for j in range(SIZE):
            if board[i][j] == EMPTY:
                return i, j

    return None


def count_solutions(board):
    """
    Count Sudoku solutions.

    Stops searching once more than one solution is found.
    """

    solutions = 0

    def solve():

        nonlocal solutions

        if solutions > 1:
            return

        empty = find_empty(board)

        if not empty:
            solutions += 1
            return

        row, col = empty

        for num in range(1, 10):

            if is_safe(board, row, col, num):

                board[row][col] = num

                solve()

                board[row][col] = EMPTY

    solve()

    return solutions


def remove_cells(board, clues):
    """
    Remove cells while ensuring the puzzle still
    has exactly one solution.
    """

    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(cells)

    cells_to_remove = SIZE * SIZE - clues

    for row, col in cells:

        if cells_to_remove == 0:
            break

        backup = board[row][col]

        board[row][col] = EMPTY

        test = deep_copy(board)

        if count_solutions(test) != 1:
            board[row][col] = backup
        else:
            cells_to_remove -= 1


def generate_puzzle(clues=35):
    """
    Generate a Sudoku puzzle with one unique solution.
    """

    board = create_empty_board()

    fill_board(board)

    solution = deep_copy(board)

    remove_cells(board, clues)

    puzzle = deep_copy(board)

    return puzzle, solution