from collections.abc import Iterator

import httpx
import pytest


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption("--api-url", action="store", default="http://localhost:8000")


@pytest.fixture(scope="session")
def api(request: pytest.FixtureRequest) -> Iterator[httpx.Client]:
    base_url = request.config.getoption("--api-url").rstrip("/")
    with httpx.Client(base_url=base_url, timeout=8.0) as client:
        try:
            client.get("/api/health")
        except httpx.HTTPError as exc:
            pytest.fail(f"Cannot reach the API at {base_url}: {exc}", pytrace=False)
        yield client


def create_game(api: httpx.Client, names: list[str] | None = None) -> dict:
    response = api.post("/api/game", json={"player_names": names or ["Ada", "Linus"]})
    assert response.status_code == 200, response.text
    return response.json()


def action_state(response: httpx.Response) -> dict:
    assert response.status_code == 200, response.text
    body = response.json()
    assert set(body) == {"state"}
    return body["state"]


def roll(api: httpx.Client, value: int) -> dict:
    return action_state(api.post("/api/game/roll", headers={"X-Test-Dice-Roll": str(value)}))
