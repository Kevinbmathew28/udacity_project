"""Sudoku puzzle generation utilities."""

import copy
import random
from typing import List, Tuple

SIZE = 9
EMPTY = 0
Board = List[List[int]]


def deep_copy(board: Board) -> Board:
    """Return a deep copy of the given Sudoku board."""
    return copy.deepcopy(board)


def create_empty_board() -> Board:
    """Create an empty 9x9 Sudoku board filled with zeros."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board: Board, row: int, col: int, num: int) -> bool:
    """Return True when placing ``num`` at ``(row, col)`` is valid."""
    for index in range(SIZE):
        if board[row][index] == num or board[index][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def fill_board(board: Board) -> bool:
    """Fill the board recursively using a backtracking algorithm."""
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


def count_solutions(board: Board, limit: int = 2) -> int:
    """Count the number of solutions for a Sudoku board up to ``limit``."""
    board_copy = deep_copy(board)

    for row in range(SIZE):
        for col in range(SIZE):
            if board_copy[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board_copy, row, col, candidate):
                        board_copy[row][col] = candidate
                        solutions = count_solutions(board_copy, limit)
                        board_copy[row][col] = EMPTY
                        if solutions >= limit:
                            return limit
                return 0

    return 1


def _has_unique_solution(board: Board) -> bool:
    """Return True when the board has exactly one solution."""
    return count_solutions(board, limit=2) == 1


def remove_cells(board: Board, clues: int) -> None:
    """Remove values from the board until the clue count is reached."""
    attempts = SIZE * SIZE - clues

    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)

        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1

def generate_puzzle(clues: int = 35) -> Tuple[Board, Board]:
    board = create_empty_board()
    fill_board(board)

    solution = deep_copy(board)

    remove_cells(board, clues)

    puzzle = deep_copy(board)

    return puzzle, solution