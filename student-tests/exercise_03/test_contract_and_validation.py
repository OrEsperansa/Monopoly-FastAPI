from conftest import create_game


def test_get_returns_the_stored_game_without_mutating_it(api):
    created = create_game(api, ["Ada", "Linus", "Grace"])
    first_read = api.get("/api/game")
    second_read = api.get("/api/game")
    assert first_read.status_code == 200
    assert first_read.json() == created
    assert second_read.json() == created


def test_failed_create_does_not_replace_the_stored_game(api):
    before = create_game(api)
    response = api.post("/api/game", json={"player_names": ["Ada"]})
    assert response.status_code == 422
    assert api.get("/api/game").json() == before
