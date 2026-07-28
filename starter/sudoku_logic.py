import copy
import random

SIZE = 9
EMPTY = 0

# Number of clues for each difficulty
DIFFICULTY_LEVELS = {
    "easy": 35,
    "medium": 45,
    "hard": 55
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


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                numbers = list(range(1, SIZE + 1))
                random.shuffle(numbers)

                for number in numbers:
                    if is_safe(board, row, col, number):
                        board[row][col] = number

                        if fill_board(board):
                            return True

                        board[row][col] = EMPTY

                return False

    return True


def remove_cells(board, clues):
    cells_to_remove = SIZE * SIZE - clues

    while cells_to_remove > 0:
        row = random.randint(0, SIZE - 1)
        col = random.randint(0, SIZE - 1)

        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            cells_to_remove -= 1


def generate_puzzle(difficulty="easy"):
    """
    Generate a Sudoku puzzle based on difficulty.

    Available difficulties:
    - easy
    - medium
    - hard
    """

    difficulty = difficulty.lower()

    clues = DIFFICULTY_LEVELS.get(
        difficulty,
        DIFFICULTY_LEVELS["easy"]
    )

    board = create_empty_board()

    fill_board(board)

    solution = deep_copy(board)

    remove_cells(board, clues)

    puzzle = deep_copy(board)

    return puzzle, solution