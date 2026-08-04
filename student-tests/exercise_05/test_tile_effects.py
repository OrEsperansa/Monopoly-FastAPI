from conftest import create_game, roll


def test_reward_and_penalty_use_the_tile_amount(api):
    create_game(api)
    reward = roll(api, 2)
    assert reward["players"][0]["money"] == 1600
    assert reward["available_actions"] == ["end_turn"]

    create_game(api)
    penalty = roll(api, 4)
    assert penalty["players"][0]["money"] == 1400
    assert penalty["available_actions"] == ["end_turn"]


def test_surprise_produces_a_legal_state_and_event(api):
    create_game(api)
    state = roll(api, 6)
    player = state["players"][0]
    assert 0 <= player["position"] < len(state["board"])
    assert state["available_actions"] == ["end_turn"]
    assert state["last_event"] == state["event_log"][-1]
    assert "Surprise" in " ".join(state["event_log"])
