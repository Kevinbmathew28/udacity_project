import pytest
import app as sudoku_app
import sudoku_logic


@pytest.fixture(autouse=True)
def reset_current():
    sudoku_app.CURRENT["puzzle"] = None
    sudoku_app.CURRENT["solution"] = None
    yield
    sudoku_app.CURRENT["puzzle"] = None
    sudoku_app.CURRENT["solution"] = None


def test_new_game_endpoint_returns_puzzle():
    client = sudoku_app.app.test_client()

    response = client.get("/new?difficulty=medium")

    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data["puzzle"], list)
    assert len(data["puzzle"]) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in data["puzzle"])
    assert data["difficulty"] == "medium"


def test_check_solution_requires_active_game():
    client = sudoku_app.app.test_client()

    response = client.post("/check", json={"board": [[1] * sudoku_logic.SIZE for _ in range(sudoku_logic.SIZE)]})

    assert response.status_code == 400
    assert response.get_json()["error"] == "No game in progress"


def test_check_solution_accepts_correct_board():
    client = sudoku_app.app.test_client()
    client.get("/new?difficulty=hard")

    response = client.post("/check", json={"board": sudoku_app.CURRENT["solution"]})

    assert response.status_code == 200
    assert response.get_json()["incorrect"] == []


def test_hint_updates_current_board_and_locks_cell():
    client = sudoku_app.app.test_client()
    client.get("/new?difficulty=hard")

    response = client.post("/hint", json={"board": sudoku_app.CURRENT["puzzle"]})

    assert response.status_code == 200
    data = response.get_json()
    assert data["row"] in range(sudoku_logic.SIZE)
    assert data["col"] in range(sudoku_logic.SIZE)
    assert data["value"] == sudoku_app.CURRENT["solution"][data["row"]][data["col"]]
    assert sudoku_app.CURRENT["puzzle"][data["row"]][data["col"]] == data["value"]


def test_hint_fills_one_empty_cell_and_updates_current_board():
    client = sudoku_app.app.test_client()
    client.get("/new?difficulty=medium")

    response = client.post("/hint", json={"board": sudoku_app.CURRENT["puzzle"]})

    assert response.status_code == 200
    data = response.get_json()
    assert set(data.keys()) == {"row", "col", "value"}
    assert sudoku_app.CURRENT["puzzle"][data["row"]][data["col"]] == data["value"]
    assert sudoku_app.CURRENT["solution"][data["row"]][data["col"]] == data["value"]
    assert sudoku_app.CURRENT["puzzle"][data["row"]][data["col"]] != 0
