import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    """Check whether it's legal to place num at board[row][col]."""
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


def fill_board(board):
    """Fill the board completely with a valid Sudoku solution using backtracking."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                numbers = list(range(1, SIZE + 1))
                random.shuffle(numbers)
                for num in numbers:
                    if is_safe(board, row, col, num):
                        board[row][col] = num
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def _count_solutions_inplace(board, limit=2):
    """Helper that counts solutions by mutating board in-place; stops when >= limit."""
    # find first empty
    for i in range(SIZE):
        for j in range(SIZE):
            if board[i][j] == EMPTY:
                total = 0
                for num in range(1, SIZE + 1):
                    if is_safe(board, i, j, num):
                        board[i][j] = num
                        total += _count_solutions_inplace(board, limit)
                        board[i][j] = EMPTY
                        if total >= limit:
                            return total
                return total
    # no empties: one solution found
    return 1


def count_solutions(board, limit=2):
    """Count number of solutions for the given (partial) board.

    Search stops early when the count reaches `limit`.
    Returns an integer in [0, limit].
    """
    board_copy = deep_copy(board)
    return _count_solutions_inplace(board_copy, limit)


def remove_cells_unique(board, clues):
    """Remove cells from `board` while ensuring the resulting puzzle has exactly one solution.

    This tries removing cells in random order; when removing a cell would introduce
    multiple solutions, it is reverted. The process stops when the desired number
    of clues remains or when all cells have been tried.
    """
    total_cells = SIZE * SIZE
    to_remove = total_cells - clues
    coords = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(coords)

    idx = 0
    while to_remove > 0 and idx < len(coords):
        r, c = coords[idx]
        if board[r][c] != EMPTY:
            temp = board[r][c]
            board[r][c] = EMPTY
            # If the board still has exactly one solution, keep removal
            sols = count_solutions(board, limit=2)
            if sols != 1:
                # revert
                board[r][c] = temp
            else:
                to_remove -= 1
        idx += 1


def generate_puzzle(clues=35):
    """Create a full valid board, then remove cells making sure the puzzle has exactly one solution."""
    board = create_empty_board()
    success = fill_board(board)
    if not success:
        # try again if unlikely failure
        board = create_empty_board()
        fill_board(board)
    solution = deep_copy(board)
    remove_cells_unique(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
