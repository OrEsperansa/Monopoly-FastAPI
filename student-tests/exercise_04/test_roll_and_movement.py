import re

import pytest

from conftest import action_state, create_game, roll


ROLL_PATTERN = re.compile(r" rolled (\d+)(?: and|,) moved to (\d+)")


def movement_event(before: dict, after: dict) -> tuple[int, int, str]:
    new_events = after["event_log"][len(before["event_log"]):]
    for event in new_events:
        match = ROLL_PATTERN.search(event)
        if match:
            return int(match.group(1)), int(match.group(2)), event
    pytest.fail("The roll did not add a movement event.")


def test_roll_uses_a_real_dice_value_and_moves_only_the_current_player(api):
    before = create_game(api)
    after = roll(api)
    value, target, _ = movement_event(before, after)

    assert 1 <= value <= 6
    assert target == (before["players"][0]["position"] + value) % len(before["board"])
    assert after["players"][1]["position"] == before["players"][1]["position"]


def test_passing_start_is_reported(api):
    state = create_game(api)
    for _ in range(100):
        current_id = state["current_player_id"]
        before_player = next(player for player in state["players"] if player["id"] == current_id)
        before = state
        state = roll(api)
        value, target, event = movement_event(before, state)
        assert target == (before_player["position"] + value) % len(state["board"])
        if before_player["position"] + value >= len(state["board"]):
            assert "received 200 for Start" in event
            return
        if state["status"] == "finished":
            state = create_game(api)
        else:
            state = action_state(api.post("/api/game/end-turn"))
    pytest.fail("No player passed Start within 100 turns.")


def test_roll_cannot_be_repeated_in_one_turn(api):
    create_game(api)
    roll(api)
    before = api.get("/api/game").json()
    response = api.post("/api/game/roll")
    assert response.status_code == 409
    assert api.get("/api/game").json() == before
