import re

from conftest import create_game, expect, fail_check, roll


ROLL_PATTERN = re.compile(r" rolled (\d+)(?: and|,) moved to (\d+)")


def landing_position(before: dict, after: dict) -> int:
    for event in after["event_log"][len(before["event_log"]):]:
        match = ROLL_PATTERN.search(event)
        if match:
            return int(match.group(2))
    fail_check("Record the landing position", "POST /api/game/roll", None, "A movement event with a target position", after["event_log"][len(before["event_log"]):], json_path="$.state.event_log")


def test_reward_penalty_and_surprise_effects(api):
    seen: set[str] = set()
    for _ in range(90):
        before = create_game(api)
        state = roll(api)
        tile = state["board"][landing_position(before, state)]

        if tile["type"] == "reward":
            expect("Apply a reward tile", "POST /api/game/roll", None, 1500 + tile["amount"], state["players"][0]["money"], json_path="$.state.players[0].money", calculation_context={"landed_tile": tile})
            seen.add("reward")
        elif tile["type"] == "penalty":
            expect("Apply a penalty tile", "POST /api/game/roll", None, 1500 - tile["amount"], state["players"][0]["money"], json_path="$.state.players[0].money", calculation_context={"landed_tile": tile})
            seen.add("penalty")
        elif tile["type"] == "surprise":
            position = state["players"][0]["position"]
            expect("Keep surprise movement on the board", "POST /api/game/roll", None, f"A position from 0 through {len(state['board']) - 1}", position, lambda result: 0 <= result < len(state["board"]), json_path="$.state.players[0].position", calculation_context={"landed_tile": tile})
            events = " ".join(state["event_log"])
            expect("Record a surprise event", "POST /api/game/roll", None, "An event containing 'Surprise'", events, lambda result: "Surprise" in result, json_path="$.state.event_log", calculation_context={"landed_tile": tile})
            seen.add("surprise")

        if seen == {"reward", "penalty", "surprise"}:
            return
    fail_check("Apply every non-property tile effect", "POST /api/game/roll", None, ["penalty", "reward", "surprise"], sorted(seen), calculation_context={"new_games_checked": 90})


def test_unowned_property_offers_buy_without_buying_automatically(api):
    for _ in range(40):
        before = create_game(api)
        state = roll(api)
        tile = state["board"][landing_position(before, state)]
        if tile["type"] == "property":
            context = {"landed_tile": tile}
            expect("Offer buying an unowned property", "POST /api/game/roll", None, ["buy", "end_turn"], state["available_actions"], json_path="$.state.available_actions", calculation_context=context)
            expect("Do not assign ownership automatically", "POST /api/game/roll", None, None, tile["owner_id"], json_path=f"$.state.board[{tile['id']}].owner_id", calculation_context=context)
            expect("Do not charge before buying", "POST /api/game/roll", None, 1500, state["players"][0]["money"], json_path="$.state.players[0].money", calculation_context=context)
            return
    fail_check("Offer buying an unowned property", "POST /api/game/roll", None, "A landing on an unowned property", "No property landing was observed", calculation_context={"new_games_checked": 40})
