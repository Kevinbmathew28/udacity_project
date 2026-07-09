import copy
import random
from typing import List, Optional, Tuple

SIZE = 9
EMPTY = 0

Board = List[List[int]]


def deep_copy(board: Board) -> Board:
    """Return a deep copy of the provided board."""
    return copy.deepcopy(board)


def create_empty_board() -> Board:
    """Create a new 9x9 Sudoku board filled with empty cells."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board: Board, row: int, col: int, num: int) -> bool:
    """Return True if placing num at the given position is valid."""
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


def _find_empty_cell(board: Board) -> Optional[Tuple[int, int]]:
    """Return the coordinates of the first empty cell, if any."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None


def _is_valid_board(board: Board) -> bool:
    """Return True if the current board does not violate Sudoku rules."""
    for row in range(SIZE):
        for col in range(SIZE):
            value = board[row][col]
            if value == EMPTY:
                continue

            board[row][col] = EMPTY
            is_valid = is_safe(board, row, col, value)
            board[row][col] = value
            if not is_valid:
                return False
    return True


def _count_solutions_recursive(board: Board, limit: int) -> int:
    """Count possible solutions for the board using backtracking."""
    empty_cell = _find_empty_cell(board)
    if empty_cell is None:
        return 1

    row, col = empty_cell
    count = 0
    possible = list(range(1, SIZE + 1))
    random.shuffle(possible)
    for candidate in possible:
        if is_safe(board, row, col, candidate):
            board[row][col] = candidate
            count += _count_solutions_recursive(board, limit)
            board[row][col] = EMPTY
            if count >= limit:
                return count
    return count


def count_solutions(board: Board, limit: int = 2) -> int:
    """Count the number of valid solutions for a puzzle."""
    board_copy = deep_copy(board)
    if not _is_valid_board(board_copy):
        return 0
    return _count_solutions_recursive(board_copy, limit)


def fill_board(board: Board) -> bool:
    """Recursively fill the board using backtracking."""
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


def remove_cells(board: Board, clues: int) -> None:
    """Remove values from the board only when the puzzle remains unique."""
    attempts = SIZE * SIZE - clues
    positions = list(range(SIZE * SIZE))
    random.shuffle(positions)

    for index in positions:
        if attempts <= 0:
            break

        row, col = divmod(index, SIZE)
        if board[row][col] == EMPTY:
            continue

        original_value = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(board) != 1:
            board[row][col] = original_value
        else:
            attempts -= 1


def generate_puzzle(clues: int = 35) -> Tuple[Board, Board]:
    """Generate a Sudoku puzzle and its solved solution."""
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
