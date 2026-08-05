import re

import pytest

from conftest import create_game, roll


ROLL_PATTERN = re.compile(r" rolled (\d+)(?: and|,) moved to (\d+)")


def landing_position(before: dict, after: dict) -> int:
    for event in after["event_log"][len(before["event_log"]):]:
        match = ROLL_PATTERN.search(event)
        if match:
            return int(match.group(2))
    pytest.fail("The roll did not add a movement event.")


def test_reward_penalty_and_surprise_effects(api):
    seen: set[str] = set()
    for _ in range(90):
        before = create_game(api)
        state = roll(api)
        tile = state["board"][landing_position(before, state)]

        if tile["type"] == "reward":
            assert state["players"][0]["money"] == 1500 + tile["amount"]
            seen.add("reward")
        elif tile["type"] == "penalty":
            assert state["players"][0]["money"] == 1500 - tile["amount"]
            seen.add("penalty")
        elif tile["type"] == "surprise":
            assert 0 <= state["players"][0]["position"] < len(state["board"])
            assert "Surprise" in " ".join(state["event_log"])
            seen.add("surprise")

        if seen == {"reward", "penalty", "surprise"}:
            return
    pytest.fail(f"Did not observe every tile effect; observed: {sorted(seen)}")


def test_unowned_property_offers_buy_without_buying_automatically(api):
    for _ in range(40):
        before = create_game(api)
        state = roll(api)
        tile = state["board"][landing_position(before, state)]
        if tile["type"] == "property":
            assert state["available_actions"] == ["buy", "end_turn"]
            assert tile["owner_id"] is None
            assert state["players"][0]["money"] == 1500
            return
    pytest.fail("Did not land on an unowned property within 40 games.")
