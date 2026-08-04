from conftest import action_state, create_game, roll


def test_end_turn_rotates_and_restores_roll(api):
    create_game(api, ["Ada", "Linus", "Grace"])
    roll(api, 2)
    state = action_state(api.post("/api/game/end-turn"))
    assert state["current_player_id"] == 2
    assert state["available_actions"] == ["roll"]


def test_unavailable_actions_return_409_without_state_change(api):
    before = create_game(api)
    response = api.post("/api/game/end-turn")
    assert response.status_code == 409
    assert "detail" in response.json()
    assert api.get("/api/game").json() == before

    roll(api, 2)
    before = api.get("/api/game").json()
    response = api.post("/api/game/buy")
    assert response.status_code == 409
    assert api.get("/api/game").json() == before


def test_turn_order_wraps_around(api):
    create_game(api, ["Ada", "Linus"])
    for expected_id in [2, 1]:
        roll(api, 2)
        state = action_state(api.post("/api/game/end-turn"))
        assert state["current_player_id"] == expected_id


def test_landing_on_another_players_property_transfers_rent(api):
    create_game(api)
    roll(api, 1)
    bought = action_state(api.post("/api/game/buy"))
    rent = bought["board"][1]["rent"]
    action_state(api.post("/api/game/end-turn"))
    rented = roll(api, 1)
    assert rented["players"][0]["money"] == 1400 + rent
    assert rented["players"][1]["money"] == 1500 - rent
    assert rented["last_event"] == rented["event_log"][-1]
