import pytest

from app import app as flask_app
from generator import count_solutions
from sudoku_logic import (
    EMPTY,
    SIZE,
    create_empty_board,
    deep_copy,
    fill_board,
    generate_puzzle,
    is_safe,
)


def is_valid_sudoku_board(board):
    for row in board:
        if sorted(row) != list(range(1, SIZE + 1)):
            return False

    for col in range(SIZE):
        column = [board[row][col] for row in range(SIZE)]
        if sorted(column) != list(range(1, SIZE + 1)):
            return False

    for box_row in range(0, SIZE, 3):
        for box_col in range(0, SIZE, 3):
            values = []
            for row in range(box_row, box_row + 3):
                for col in range(box_col, box_col + 3):
                    values.append(board[row][col])
            if sorted(values) != list(range(1, SIZE + 1)):
                return False

    return True


def test_create_empty_board_has_expected_shape():
    board = create_empty_board()

    assert len(board) == SIZE
    assert all(len(row) == SIZE for row in board)
    assert all(cell == EMPTY for row in board for cell in row)


def test_deep_copy_returns_independent_copy():
    board = [[1, 2, 3], [4, 5, 6]]

    copied_board = deep_copy(board)
    copied_board[0][0] = 99

    assert board[0][0] == 1
    assert copied_board[0][0] == 99


def test_is_safe_rejects_conflicts_in_row_column_and_box():
    board = create_empty_board()
    board[0][0] = 5

    assert is_safe(board, 0, 1, 5) is False
    assert is_safe(board, 1, 0, 5) is False
    assert is_safe(board, 1, 1, 5) is False
    assert is_safe(board, 0, 1, 4) is True


def test_fill_board_returns_a_complete_valid_solution():
    board = create_empty_board()

    assert fill_board(board) is True
    assert is_valid_sudoku_board(board)


def test_count_solutions_detects_multiple_solutions_for_an_empty_board():
    board = create_empty_board()

    assert count_solutions(board, limit=2) == 2


def test_generate_puzzle_returns_a_puzzle_and_solution():
    puzzle, solution = generate_puzzle(clues=35)

    assert len(puzzle) == SIZE
    assert len(solution) == SIZE
    assert all(len(row) == SIZE for row in puzzle)
    assert all(len(row) == SIZE for row in solution)
    assert is_valid_sudoku_board(solution)
    assert count_solutions(puzzle, limit=2) == 1

    for row in range(SIZE):
        for col in range(SIZE):
            if puzzle[row][col] == EMPTY:
                continue
            assert puzzle[row][col] == solution[row][col]


def test_new_game_route_uses_difficulty_to_select_clues():
    client = flask_app.test_client()
    response = client.get('/new?difficulty=hard')

    assert response.status_code == 200
    puzzle = response.get_json()['puzzle']
    clues = sum(1 for row in puzzle for cell in row if cell != EMPTY)

    assert clues == 25
