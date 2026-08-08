import re

import pytest

from conftest import create_game, end_turn, roll


STATE_KEYS = {
    "status", "current_player_id", "winner_id", "available_actions",
    "players", "board", "last_event", "event_log",
}
ROLL_PATTERN = re.compile(r" rolled (\d+)(?: and|,) moved to (\d+)")


def test_passing_start_reports_the_bonus_and_keeps_a_complete_state(api):
    state = create_game(api)
    for _ in range(100):
        current_id = state["current_player_id"]
        before_player = next(player for player in state["players"] if player["id"] == current_id)
        event_count = len(state["event_log"])
        state = roll(api)
        assert set(state) == STATE_KEYS
        new_events = state["event_log"][event_count:]
        movement = next((event for event in new_events if ROLL_PATTERN.search(event)), None)
        assert movement is not None
        match = ROLL_PATTERN.search(movement)
        value, target = map(int, match.groups())
        assert target == (before_player["position"] + value) % len(state["board"])
        if before_player["position"] + value >= len(state["board"]):
            assert "received 200 for Start" in movement
            return
        if state["status"] == "finished":
            state = create_game(api)
        else:
            state = end_turn(api)
    pytest.fail("No player passed Start within 100 turns.")


def test_action_errors_do_not_mutate_the_game(api):
    before = create_game(api)
    response = api.post("/api/game/end-turn")
    assert response.status_code == 409
    assert set(response.json()) == {"detail"}
    assert api.get("/api/game").json() == before
