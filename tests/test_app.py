import copy
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "starter"))

import app as sudoku_app


@pytest.fixture(autouse=True)
def reset_current_state():
    sudoku_app.CURRENT["puzzle"] = None
    sudoku_app.CURRENT["solution"] = None
    yield
    sudoku_app.CURRENT["puzzle"] = None
    sudoku_app.CURRENT["solution"] = None


@pytest.fixture()
def client():
    sudoku_app.app.config.update(TESTING=True)
    with sudoku_app.app.test_client() as client:
        yield client


def test_index_route_returns_html(client):
    response = client.get("/")

    assert response.status_code == 200
    assert b"<!" in response.data.lower()


def test_new_game_creates_puzzle_and_solution(client):
    response = client.get("/new?clues=40")

    assert response.status_code == 200
    data = response.get_json()
    assert "puzzle" in data
    assert "solution" in data
    assert len(data["puzzle"]) == sudoku_app.sudoku_logic.SIZE
    assert sudoku_app.CURRENT["puzzle"] is not None
    assert sudoku_app.CURRENT["solution"] is not None


def test_check_solution_returns_no_incorrect_for_correct_board(client):
    client.get("/new?clues=35")
    solution = copy.deepcopy(sudoku_app.CURRENT["solution"])

    response = client.post(
        "/check",
        json={"board": solution},
    )

    assert response.status_code == 200
    assert response.get_json() == {"incorrect": []}


def test_check_solution_reports_incorrect_cells(client):
    client.get("/new?clues=35")
    solution = copy.deepcopy(sudoku_app.CURRENT["solution"])
    solution[0][0] = 8

    response = client.post(
        "/check",
        json={"board": solution},
    )

    assert response.status_code == 200
    assert response.get_json()["incorrect"] == [[0, 0]]


def test_check_solution_without_active_game_returns_error(client):
    response = client.post(
        "/check",
        json={"board": [[0] * sudoku_app.sudoku_logic.SIZE for _ in range(sudoku_app.sudoku_logic.SIZE)]},
    )

    assert response.status_code == 400
    assert response.get_json() == {"error": "No game in progress"}


def test_new_game_accepts_difficulty_parameter(client):
    response = client.get("/new?difficulty=hard")

    assert response.status_code == 200
    assert response.get_json()["difficulty"] == "hard"


def test_generate_puzzle_returns_a_uniquely_solved_board():
    puzzle, solution = sudoku_app.sudoku_logic.generate_puzzle(clues=30, difficulty="hard")

    assert puzzle is not None
    assert solution is not None
    assert sudoku_app.sudoku_logic.count_solutions(copy.deepcopy(puzzle)) == 1
