import json

import pytest
from app import app, CURRENT


@pytest.fixture(autouse=True)
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_index_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'<title>Sudoku</title>' in response.data or b'<html>' in response.data


def test_new_game_route_defaults(client):
    response = client.get('/new')
    assert response.status_code == 200
    data = response.get_json()
    assert 'puzzle' in data
    assert isinstance(data['puzzle'], list)
    assert len(data['puzzle']) == 9
    assert CURRENT['solution'] is not None


def test_new_game_route_custom_clues(client):
    response = client.get('/new?clues=30')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['puzzle']) == 9
    assert sum(1 for row in data['puzzle'] for cell in row if cell == 0) == 81 - 30


def test_new_game_route_includes_solution(client):
    response = client.get('/new')
    assert response.status_code == 200
    data = response.get_json()
    assert 'solution' in data
    assert isinstance(data['solution'], list)
    assert len(data['solution']) == 9


def test_new_game_route_easy_difficulty(client):
    response = client.get('/new?difficulty=easy')
    assert response.status_code == 200
    data = response.get_json()
    assert sum(1 for row in data['puzzle'] for cell in row if cell != 0) == 45


def test_new_game_route_hard_difficulty(client):
    response = client.get('/new?difficulty=hard')
    assert response.status_code == 200
    data = response.get_json()
    assert sum(1 for row in data['puzzle'] for cell in row if cell != 0) == 25


def test_check_solution_without_game(client):
    CURRENT['solution'] = None
    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})
    assert response.status_code == 400
    data = response.get_json()
    assert data['error'] == 'No game in progress'


def test_check_solution_incorrect(client):
    # start a game so CURRENT['solution'] exists
    response = client.get('/new')
    solution = CURRENT['solution']
    board = [[0] * 9 for _ in range(9)]
    response = client.post('/check', json={'board': board})
    assert response.status_code == 200
    data = response.get_json()
    assert 'incorrect' in data
    assert isinstance(data['incorrect'], list)
    assert len(data['incorrect']) > 0


def test_check_solution_correct(client):
    response = client.get('/new')
    solution = CURRENT['solution']
    response = client.post('/check', json={'board': solution})
    assert response.status_code == 200
    data = response.get_json()
    assert data['incorrect'] == []
