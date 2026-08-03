from conftest import create_game


def test_create_and_retrieve_initial_game(api):
    created = create_game(api, ["Ada", "Linus", "Grace"])
    assert created["status"] == "active"
    assert created["current_player_id"] == 1
    assert created["winner_id"] is None
    assert created["available_actions"] == ["roll"]
    assert len(created["players"]) == 3
    assert len(created["board"]) == 16
    assert api.get("/api/game").json() == created


def test_players_begin_with_expected_values(api):
    state = create_game(api)
    assert [(player["id"], player["name"]) for player in state["players"]] == [(1, "Ada"), (2, "Linus")]
    for player in state["players"]:
        assert player["money"] == 1500
        assert player["position"] == 0
        assert player["is_bankrupt"] is False
        assert player["owned_tile_ids"] == []
    assert state["board"][0]["id"] == 0
    assert state["board"][0]["type"] == "start"
