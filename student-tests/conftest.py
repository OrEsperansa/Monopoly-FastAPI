from collections.abc import Iterator
import json
from typing import Any, Callable

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


def _display(value: Any) -> str:
    try:
        return json.dumps(value, ensure_ascii=False, sort_keys=True, default=str)
    except (TypeError, ValueError):
        return repr(value)


def fail_check(
    functionality: str,
    endpoint: str,
    inserted: Any,
    expected: Any,
    got: Any,
    *,
    json_path: str | None = None,
    calculation_context: Any = None,
) -> None:
    details = [
        f"Functionality tested: {functionality}",
        f"Endpoint Tested: {endpoint}",
        f"Value inserted: {_display(inserted)}",
    ]
    if calculation_context is not None:
        details.append(f"Calculation context: {_display(calculation_context)}")
    if json_path is not None:
        details.append(f"JSON location checked: {json_path}")
    details.extend([
        f"Expected return value: {_display(expected)}",
        f"Got return value: {_display(got)}",
    ])
    pytest.fail(
        "\n".join(details),
        pytrace=False,
    )


def expect(
    functionality: str,
    endpoint: str,
    inserted: Any,
    expected: Any,
    got: Any,
    predicate: Callable[[Any], bool] | None = None,
    *,
    json_path: str | None = None,
    calculation_context: Any = None,
) -> Any:
    try:
        passed = predicate(got) if predicate else got == expected
    except Exception:
        passed = False
    if not passed:
        fail_check(
            functionality,
            endpoint,
            inserted,
            expected,
            got,
            json_path=json_path,
            calculation_context=calculation_context,
        )
    return got


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo):
    """Guarantee that even unexpected test errors remain actionable in the UI."""
    outcome = yield
    report = outcome.get_result()
    if not report.failed:
        return
    original = str(report.longrepr)
    if "Functionality tested:" in original:
        return
    report.longrepr = "\n".join([
        f"Functionality tested: {item.name.replace('_', ' ')}",
        "Endpoint Tested: Check the endpoint named by this checkpoint",
        "Value inserted: See the request and test context below",
        "Expected return value: The documented HTTP contract without an unhandled error",
        f"Got return value: {original}",
    ])


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption("--api-url", action="store", default="http://localhost:8000")


@pytest.fixture(scope="session")
def api(request: pytest.FixtureRequest) -> Iterator[httpx.Client]:
    base_url = request.config.getoption("--api-url").rstrip("/")
    with httpx.Client(base_url=base_url, timeout=8.0) as client:
        connection_error = None
        try:
            client.get("/api/health")
        except httpx.HTTPError as exc:
            connection_error = str(exc)
        if connection_error:
            fail_check("API availability", "GET /api/health", None, "A reachable HTTP API", connection_error, calculation_context={"base_url": base_url})
        yield client


def create_game(api: httpx.Client, names: list[str] | None = None) -> dict:
    payload = {"player_names": names or ["Ada", "Linus"]}
    response = api.post("/api/game", json=payload)
    expect("Create a game", "POST /api/game", payload, 200, response.status_code)
    return assert_game_state(response_json(response, "Create a game", payload), "POST /api/game", payload)


def response_json(response: httpx.Response, functionality: str, inserted: Any = None) -> Any:
    endpoint = f"{response.request.method} {response.request.url.path}"
    try:
        return response.json()
    except ValueError:
        fail_check(functionality, endpoint, inserted, "A valid JSON response", response.text)


def assert_game_state(
    state: dict,
    endpoint: str = "GameState response",
    inserted: Any = None,
    json_path: str = "$",
) -> dict:
    expect("Return game state as a JSON object", endpoint, inserted, "dict", type(state).__name__, json_path=json_path)
    expect("Return the complete game-state contract", endpoint, inserted, sorted(GAME_STATE_KEYS), sorted(state), json_path=json_path)
    for key in ("players", "board", "available_actions", "event_log"):
        expect(f"Return {key} as a list", endpoint, inserted, "list", type(state.get(key)).__name__, json_path=f"{json_path}.{key}")
    return state


def action_state(response: httpx.Response) -> dict:
    endpoint = f"{response.request.method} {response.request.url.path}"
    expect("Perform the requested game action", endpoint, None, 200, response.status_code)
    body = response_json(response, "Return the action result", None)
    expect("Return the action result as a JSON object", endpoint, None, "dict", type(body).__name__, json_path="$")
    expect("Wrap an action result in state", endpoint, None, ["state"], sorted(body), json_path="$")
    expect("Include state in the action response", endpoint, None, "A response containing state", body, lambda result: "state" in result, json_path="$.state")
    return assert_game_state(body["state"], endpoint, json_path="$.state")


def roll(api: httpx.Client) -> dict:
    return action_state(api.post("/api/game/roll"))
