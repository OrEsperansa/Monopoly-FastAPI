from collections.abc import Iterator

import httpx
import pytest


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption("--api-url", action="store", default="http://localhost:8000")


@pytest.fixture(scope="session")
def api(request: pytest.FixtureRequest) -> Iterator[httpx.Client]:
    with httpx.Client(base_url=request.config.getoption("--api-url").rstrip("/"), timeout=8.0) as client:
        yield client


def create_game(api: httpx.Client) -> dict:
    response = api.post("/api/game", json={"player_names": ["Ada", "Linus"]})
    assert response.status_code == 200, response.text
    return response.json()


def roll(api: httpx.Client) -> dict:
    response = api.post("/api/game/roll")
    assert response.status_code == 200, response.text
    return response.json()["state"]


def end_turn(api: httpx.Client) -> dict:
    response = api.post("/api/game/end-turn")
    assert response.status_code == 200, response.text
    return response.json()["state"]
