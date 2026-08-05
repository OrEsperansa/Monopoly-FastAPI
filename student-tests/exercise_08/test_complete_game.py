import pytest

from conftest import action_state, create_game, roll


def test_game_can_reach_bankruptcy_and_a_winner(api):
    state = create_game(api)
    for _ in range(2000):
        current = state["current_player_id"]
        state = roll(api)
        if state["status"] == "finished":
            break
        if current == 1 and "buy" in state["available_actions"]:
            buyer = next(player for player in state["players"] if player["id"] == current)
            tile = state["board"][buyer["position"]]
            if buyer["money"] >= tile["price"]:
                state = action_state(api.post("/api/game/buy"))
        state = action_state(api.post("/api/game/end-turn"))
    else:
        pytest.fail("The game did not produce a winner within 2000 turns.")

    assert state["status"] == "finished"
    assert state["winner_id"] in {player["id"] for player in state["players"]}
    assert state["available_actions"] == []
    assert sum(not player["is_bankrupt"] for player in state["players"]) == 1


def test_reset_returns_the_empty_ui_contract(api):
    create_game(api)
    state = action_state(api.post("/api/game/reset"))
    assert state["status"] == "not_started"
    assert state["current_player_id"] is None
    assert state["winner_id"] is None
    assert state["available_actions"] == []
    assert state["players"] == []
    assert state["board"] == []
    assert state["last_event"] == state["event_log"][-1]
