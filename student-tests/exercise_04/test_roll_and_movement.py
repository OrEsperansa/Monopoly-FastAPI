import re

from conftest import create_game, expect, fail_check, roll


ROLL_PATTERN = re.compile(r" rolled (\d+)(?: and|,) moved to (\d+)")


def movement_event(before: dict, after: dict) -> tuple[int, int, str]:
    new_events = after["event_log"][len(before["event_log"]):]
    for event in new_events:
        match = ROLL_PATTERN.search(event)
        if match:
            return int(match.group(1)), int(match.group(2)), event
    fail_check("Record dice movement", "POST /api/game/roll", None, "An event containing the dice value and target position", new_events, json_path="$.state.event_log")


def test_roll_uses_a_real_dice_value_and_moves_only_the_current_player(api):
    before = create_game(api)
    after = roll(api)
    value, target, _ = movement_event(before, after)

    expect("Generate a real dice value", "POST /api/game/roll", None, "An integer from 1 through 6", value, lambda result: 1 <= result <= 6, json_path="$.state.event_log (rolled value)")
    expected_target = (before["players"][0]["position"] + value) % len(before["board"])
    context = {"observed_dice": value, "previous_position": before["players"][0]["position"]}
    expect("Move the current player", "POST /api/game/roll", None, expected_target, target, json_path="$.state.event_log (target position)", calculation_context=context)
    expect("Do not move inactive players", "POST /api/game/roll", None, before["players"][1]["position"], after["players"][1]["position"], json_path="$.state.players[1].position", calculation_context=context)


def test_roll_cannot_be_repeated_in_one_turn(api):
    create_game(api)
    roll(api)
    before = api.get("/api/game").json()
    response = api.post("/api/game/roll")
    expect("Reject a second roll in the same turn", "POST /api/game/roll", None, 409, response.status_code)
    expect("Rejected roll does not mutate state", "GET /api/game", None, before, api.get("/api/game").json(), json_path="$", calculation_context={"previous_action": "A repeated roll request"})
