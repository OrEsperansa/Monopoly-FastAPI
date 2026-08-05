from collections.abc import Iterator

import httpx
import pytest


GAME_STATE_KEYS = {
    "status",
    "current_player_id",
    "winner_id",
    "available_actions",
    "players",
    "board",
    "last_event",
    "event_log",
}


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
    return assert_game_state(response.json())


def assert_game_state(state: dict) -> dict:
    assert set(state) == GAME_STATE_KEYS
    assert isinstance(state["players"], list)
    assert isinstance(state["board"], list)
    assert isinstance(state["available_actions"], list)
    assert isinstance(state["event_log"], list)
    return state


def action_state(response: httpx.Response) -> dict:
    assert response.status_code == 200, response.text
    body = response.json()
    assert set(body) == {"state"}
    return assert_game_state(body["state"])


def roll(api: httpx.Client) -> dict:
    return action_state(api.post("/api/game/roll"))
