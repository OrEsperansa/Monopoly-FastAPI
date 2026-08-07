import re

from conftest import action_state, create_game, expect, fail_check, roll


RENT_PATTERN = re.compile(r"^(.+) paid (\d+) rent to (.+) for (.+)\.$")


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
            context = {"renter": renter_name, "owner": owner_name, "rent": amount, "start_bonus": start_bonus}
            expect("Deduct rent from the renter", "POST /api/game/roll", None, before_money[renter_name] + start_bonus - amount, after_money[renter_name], json_path=f"$.state.players[name={renter_name}].money", calculation_context=context)
            expect("Pay rent to the owner", "POST /api/game/roll", None, before_money[owner_name] + amount, after_money[owner_name], json_path=f"$.state.players[name={owner_name}].money", calculation_context=context)
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
    fail_check("Transfer rent between players", "POST /api/game/roll", None, "At least one rent transfer", "No rent event was observed", calculation_context={"turns_checked": 500})
