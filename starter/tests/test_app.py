import pytest

from sudoku import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_home_page_loads(client):
    response = client.get("/")
    assert response.status_code == 200


def test_new_game_api_returns_puzzle(client):
    response = client.get("/api/new-game?difficulty=easy")
    data = response.get_json()

    assert response.status_code == 200
    assert "puzzle" in data
    assert "solution" in data
    assert data["difficulty"] == "easy"
    assert len(data["puzzle"]) == 9