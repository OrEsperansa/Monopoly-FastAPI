from conftest import create_game, expect


def test_get_returns_the_stored_game_without_mutating_it(api):
    created = create_game(api, ["Ada", "Linus", "Grace"])
    first_read = api.get("/api/game")
    second_read = api.get("/api/game")
    expect("Retrieve the active game", "GET /api/game", None, 200, first_read.status_code)
    expect("Preserve stored game state", "GET /api/game", None, created, first_read.json(), json_path="$")
    expect("GET does not mutate game state", "GET /api/game", None, created, second_read.json(), json_path="$")


def test_failed_create_does_not_replace_the_stored_game(api):
    before = create_game(api)
    response = api.post("/api/game", json={"player_names": ["Ada"]})
    payload = {"player_names": ["Ada"]}
    expect("Reject an invalid replacement game", "POST /api/game", payload, 422, response.status_code)
    expect("Failed creation preserves the active game", "GET /api/game", None, before, api.get("/api/game").json(), json_path="$", calculation_context={"rejected_create_body": payload})
