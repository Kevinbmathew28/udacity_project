import copy
import random

SIZE = 9
EMPTY = 0


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


def fill_board(board):
    # Standard backtracking fill
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


def remove_cells(board, clues):
    # Remove cells until only 'clues' remain
    total_cells = SIZE * SIZE
    to_remove = total_cells - clues
    # Work on a list of coordinates to avoid infinite loops
    coords = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(coords)
    idx = 0
    while to_remove > 0 and idx < len(coords):
        r, c = coords[idx]
        if board[r][c] != EMPTY:
            board[r][c] = EMPTY
            to_remove -= 1
        idx += 1


def generate_puzzle(clues=35):
    # Create a full valid board, then remove cells to form the puzzle
    board = create_empty_board()
    success = fill_board(board)
    if not success:
        # In the unlikely event generation fails, try again
        board = create_empty_board()
        fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
