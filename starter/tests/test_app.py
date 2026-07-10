from pathlib import Path
import sys

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import app as app_module


@pytest.fixture
def client():
    app_module.app.config.update(TESTING=True)
    with app_module.app.test_client() as client:
        yield client


def test_new_endpoint_returns_puzzle(client):
    response = client.get('/new')
    assert response.status_code == 200
    data = response.get_json()
    assert 'puzzle' in data
    assert len(data['puzzle']) == 9
    assert all(len(row) == 9 for row in data['puzzle'])


def test_check_endpoint_returns_incorrect_positions(client):
    client.get('/new')
    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})
    assert response.status_code == 200
    data = response.get_json()
    assert 'incorrect' in data
