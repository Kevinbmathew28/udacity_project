def test_home_page_loads(client):
    response = client.get("/")

    assert response.status_code == 200
    assert b"Sudoku" in response.data


def test_new_game_api_returns_puzzle(client):
    response = client.post("/api/new", json={"difficulty": "easy"})
    data = response.get_json()

    assert response.status_code == 200
    assert "puzzle" in data
    assert "fixed" in data
    assert data["difficulty"] == "easy"


def test_validate_move_without_game_returns_error(client):
    response = client.post("/api/validate", json={
        "row": 0,
        "col": 0,
        "value": 1,
    })

    assert response.status_code == 400


def test_check_board_after_new_game(client):
    client.post("/api/new", json={"difficulty": "easy"})

    empty_board = [[0 for _ in range(9)] for _ in range(9)]

    response = client.post("/api/check", json={"board": empty_board})
    data = response.get_json()

    assert response.status_code == 200
    assert data["solved"] is False
    assert "errors" in data