import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_game_repository
from app.main import app


@pytest.fixture
def client() -> TestClient:
    get_game_repository().reset()
    return TestClient(app)


def create_game(client: TestClient, names: list[str] | None = None) -> dict:
    response = client.post("/api/game", json={"player_names": names or ["Ada", "Linus"]})
    assert response.status_code == 200
    return response.json()
