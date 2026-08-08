import re

from conftest import action_state, create_game, expect, fail_check, roll


ROLL_PATTERN = re.compile(r" rolled (\d+)(?: and|,) moved to (\d+)")


def movement_event(before: dict, after: dict) -> tuple[int, int, str]:
    new_events = after["event_log"][len(before["event_log"]):]
    for event in new_events:
        match = ROLL_PATTERN.search(event)
        if match:
            return int(match.group(1)), int(match.group(2)), event
    fail_check(
        "Record dice movement",
        "POST /api/game/roll",
        None,
        "An event containing the dice value and target position",
        new_events,
        json_path="$.state.event_log",
    )


def test_end_turn_rotates_and_restores_roll(api):
    create_game(api, ["Ada", "Linus", "Grace"])
    roll(api)
    state = action_state(api.post("/api/game/end-turn"))
    expect("Advance to the next player", "POST /api/game/end-turn", None, 2, state["current_player_id"], json_path="$.state.current_player_id")
    expect("Restore rolling for the next player", "POST /api/game/end-turn", None, ["roll"], state["available_actions"], json_path="$.state.available_actions")


def test_end_turn_cannot_run_before_roll(api):
    before = create_game(api)
    response = api.post("/api/game/end-turn")
    expect("Reject ending a turn before rolling", "POST /api/game/end-turn", None, 409, response.status_code)
    expect("Explain an unavailable action", "POST /api/game/end-turn", None, "An error message", response.json(), lambda body: "detail" in body, json_path="$.detail")
    expect("Rejected end-turn does not mutate state", "GET /api/game", None, before, api.get("/api/game").json(), json_path="$", calculation_context={"previous_action": "An early end-turn request"})


def test_turn_order_wraps_around(api):
    create_game(api, ["Ada", "Linus"])
    for expected_id in [2, 1]:
        roll(api)
        state = action_state(api.post("/api/game/end-turn"))
        expect("Wrap turn order around", "POST /api/game/end-turn", None, expected_id, state["current_player_id"], json_path="$.state.current_player_id")


def test_passing_start_is_reported(api):
    state = create_game(api)
    for _ in range(100):
        current_id = state["current_player_id"]
        before_player = next(player for player in state["players"] if player["id"] == current_id)
        before = state
        state = roll(api)
        value, target, event = movement_event(before, state)
        expected_target = (before_player["position"] + value) % len(state["board"])
        context = {"observed_dice": value, "previous_position": before_player["position"]}
        expect("Move on a circular board", "POST /api/game/roll", None, expected_target, target, json_path="$.state.event_log (target position)", calculation_context=context)
        if before_player["position"] + value >= len(state["board"]):
            expect("Award the Start bonus", "POST /api/game/roll", None, "Movement event containing 'received 200 for Start'", event, lambda result: "received 200 for Start" in result, json_path="$.state.event_log (new movement event)", calculation_context=context)
            return
        state = action_state(api.post("/api/game/end-turn"))
    fail_check("Award the Start bonus", "POST /api/game/roll", None, "At least one player passes Start", "No Start crossing was observed", calculation_context={"turns_checked": 100})
