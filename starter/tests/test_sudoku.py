import pytest

import app as app_module
import sudoku_logic


@pytest.fixture
def client():
    app_module.CURRENT["puzzle"] = None
    app_module.CURRENT["solution"] = None
    app_module.app.config.update(TESTING=True)
    with app_module.app.test_client() as client:
        yield client


def test_create_empty_board():
    board = sudoku_logic.create_empty_board()

    assert len(board) == 9
    assert all(len(row) == 9 for row in board)
    assert all(cell == 0 for row in board for cell in row)


def test_is_safe():
    board = sudoku_logic.create_empty_board()
    assert sudoku_logic.is_safe(board, 0, 0, 5) is True

    board[0][0] = 5
    assert sudoku_logic.is_safe(board, 0, 1, 5) is False

    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    board[1][0] = 5
    assert sudoku_logic.is_safe(board, 2, 0, 5) is False


def test_fill_board():
    board = sudoku_logic.create_empty_board()

    assert sudoku_logic.fill_board(board) is True

    values = [value for row in board for value in row]
    assert all(value != 0 for value in values)

    for row in board:
        assert len(set(row)) == 9

    for col in range(sudoku_logic.SIZE):
        column_values = [board[row][col] for row in range(sudoku_logic.SIZE)]
        assert len(set(column_values)) == 9

    for box_row in range(0, sudoku_logic.SIZE, 3):
        for box_col in range(0, sudoku_logic.SIZE, 3):
            box_values = [
                board[r][c]
                for r in range(box_row, box_row + 3)
                for c in range(box_col, box_col + 3)
            ]
            assert len(set(box_values)) == 9


def test_generate_puzzle():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=35)

    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert all(len(row) == sudoku_logic.SIZE for row in solution)
    assert any(cell == 0 for row in puzzle for cell in row)
    assert all(cell != 0 for row in solution for cell in row)


def test_get_new_endpoint_returns_puzzle(client):
    response = client.get("/new")

    assert response.status_code == 200
    data = response.get_json()
    assert "puzzle" in data
    assert len(data["puzzle"]) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in data["puzzle"])


def test_check_endpoint_returns_incorrect_positions(client):
    response = client.get("/new")
    assert response.status_code == 200

    solution = app_module.CURRENT["solution"]
    assert solution is not None

    response = client.post("/check", json={"board": solution})

    assert response.status_code == 200
    assert response.get_json()["incorrect"] == []
