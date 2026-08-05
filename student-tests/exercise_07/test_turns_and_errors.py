import re

import pytest

from conftest import action_state, create_game, roll


RENT_PATTERN = re.compile(r"^(.+) paid (\d+) rent to (.+) for (.+)\.$")


def test_end_turn_rotates_and_restores_roll(api):
    create_game(api, ["Ada", "Linus", "Grace"])
    roll(api)
    state = action_state(api.post("/api/game/end-turn"))
    assert state["current_player_id"] == 2
    assert state["available_actions"] == ["roll"]


def test_unavailable_actions_return_409_without_state_change(api):
    before = create_game(api)
    response = api.post("/api/game/end-turn")
    assert response.status_code == 409
    assert "detail" in response.json()
    assert api.get("/api/game").json() == before

    roll(api)
    before = api.get("/api/game").json()
    response = api.post("/api/game/roll")
    assert response.status_code == 409
    assert api.get("/api/game").json() == before


def test_turn_order_wraps_around(api):
    create_game(api, ["Ada", "Linus"])
    for expected_id in [2, 1]:
        roll(api)
        state = action_state(api.post("/api/game/end-turn"))
        assert state["current_player_id"] == expected_id


def test_landing_on_another_players_property_transfers_rent(api):
    state = create_game(api)
    for _ in range(500):
        current_id = state["current_player_id"]
        before = state
        state = roll(api)
        new_events = state["event_log"][len(before["event_log"]):]
        rent_event = next((RENT_PATTERN.match(event) for event in new_events if RENT_PATTERN.match(event)), None)
        if rent_event:
            renter_name, amount_text, owner_name, _ = rent_event.groups()
            amount = int(amount_text)
            before_money = {player["name"]: player["money"] for player in before["players"]}
            after_money = {player["name"]: player["money"] for player in state["players"]}
            start_bonus = 200 if any("received 200 for Start" in event for event in new_events) else 0
            assert after_money[renter_name] == before_money[renter_name] + start_bonus - amount
            assert after_money[owner_name] == before_money[owner_name] + amount
            return

        if state["status"] == "finished":
            state = create_game(api)
            continue
        if current_id == 1 and "buy" in state["available_actions"]:
            buyer = next(player for player in state["players"] if player["id"] == current_id)
            tile = state["board"][buyer["position"]]
            if buyer["money"] >= tile["price"]:
                state = action_state(api.post("/api/game/buy"))
        state = action_state(api.post("/api/game/end-turn"))
    pytest.fail("No rent transfer occurred within 500 turns.")
