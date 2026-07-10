from pathlib import Path
import sys

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import sudoku_logic


def test_create_empty_board_returns_9x9_zero_board():
    board = sudoku_logic.create_empty_board()
    assert board == [[0] * sudoku_logic.SIZE for _ in range(sudoku_logic.SIZE)]


def test_is_safe_rejects_conflicts_in_row_column_and_box():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 1
    board[0][1] = 2
    assert sudoku_logic.is_safe(board, 0, 2, 3) is True
    assert sudoku_logic.is_safe(board, 0, 1, 1) is False
    assert sudoku_logic.is_safe(board, 1, 0, 1) is False
    assert sudoku_logic.is_safe(board, 2, 2, 1) is False


def test_fill_board_fills_complete_board():
    board = sudoku_logic.create_empty_board()
    assert sudoku_logic.fill_board(board) is True
    assert all(cell != 0 for row in board for cell in row)


def test_generate_puzzle_returns_puzzle_and_solution():
    puzzle, solution = sudoku_logic.generate_puzzle(35)
    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert all(len(row) == sudoku_logic.SIZE for row in solution)
    assert puzzle != solution
