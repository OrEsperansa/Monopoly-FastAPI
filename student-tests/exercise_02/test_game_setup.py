from conftest import create_game


def test_create_returns_the_initial_game_contract(api):
    created = create_game(api, ["Ada", "Linus", "Grace"])
    assert created["status"] == "active"
    assert created["current_player_id"] == 1
    assert created["winner_id"] is None
    assert created["available_actions"] == ["roll"]
    assert len(created["players"]) == 3
    assert len(created["board"]) == 16
    assert set(created) == {
        "status", "current_player_id", "winner_id", "available_actions",
        "players", "board", "last_event", "event_log",
    }


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


def test_create_validates_and_normalizes_player_names(api):
    invalid_names = [["Ada"], ["A", "B", "C", "D", "E"], ["Ada", ""], ["Ada", "ada"]]
    for names in invalid_names:
        response = api.post("/api/game", json={"player_names": names})
        assert response.status_code == 422
        assert "detail" in response.json()

    state = create_game(api, ["  Ada  ", " Linus"])
    assert [player["name"] for player in state["players"]] == ["Ada", "Linus"]
