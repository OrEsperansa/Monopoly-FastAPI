from conftest import create_game


GAME_KEYS = {
    "status", "current_player_id", "winner_id", "available_actions",
    "players", "board", "last_event", "event_log",
}
PLAYER_KEYS = {"id", "name", "money", "position", "is_bankrupt", "owned_tile_ids"}
TILE_KEYS = {"id", "name", "type"}


def test_game_state_has_the_complete_ui_contract(api):
    state = create_game(api)
    assert set(state) == GAME_KEYS
    assert all(set(player) == PLAYER_KEYS for player in state["players"])
    assert all(TILE_KEYS <= set(tile) for tile in state["board"])
    assert state["last_event"] == state["event_log"][-1]


def test_invalid_names_return_422_without_replacing_state(api):
    before = create_game(api)
    invalid_names = [["Ada"], ["A", "B", "C", "D", "E"], ["Ada", ""], ["Ada", "ada"]]
    for names in invalid_names:
        response = api.post("/api/game", json={"player_names": names})
        assert response.status_code == 422
        assert "detail" in response.json()
        assert api.get("/api/game").json() == before


def test_outer_whitespace_is_removed(api):
    state = create_game(api, ["  Ada  ", " Linus"])
    assert [player["name"] for player in state["players"]] == ["Ada", "Linus"]
