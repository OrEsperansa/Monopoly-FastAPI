from conftest import action_state, create_game, expect, fail_check, roll


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
        fail_check("Finish the game", "POST /api/game/roll and /api/game/end-turn", None, "A finished game with a winner", state, json_path="$.state", calculation_context={"turns_checked": 2000})

    player_ids = {player["id"] for player in state["players"]}
    expect("Mark the completed game", "POST /api/game/roll", None, "finished", state["status"], json_path="$.state.status")
    expect("Select an existing player as winner", "POST /api/game/roll", None, f"One of {sorted(player_ids)}", state["winner_id"], lambda result: result in player_ids, json_path="$.state.winner_id")
    expect("Disable actions after game completion", "POST /api/game/roll", None, [], state["available_actions"], json_path="$.state.available_actions")
    expect("Leave exactly one solvent player", "POST /api/game/roll", None, 1, sum(not player["is_bankrupt"] for player in state["players"]), json_path="$.state.players[*].is_bankrupt")


def test_reset_returns_the_empty_ui_contract(api):
    create_game(api)
    state = action_state(api.post("/api/game/reset"))
    expect("Reset game status", "POST /api/game/reset", None, "not_started", state["status"], json_path="$.state.status")
    expect("Clear the current player", "POST /api/game/reset", None, None, state["current_player_id"], json_path="$.state.current_player_id")
    expect("Clear the winner", "POST /api/game/reset", None, None, state["winner_id"], json_path="$.state.winner_id")
    expect("Clear available actions", "POST /api/game/reset", None, [], state["available_actions"], json_path="$.state.available_actions")
    expect("Clear players", "POST /api/game/reset", None, [], state["players"], json_path="$.state.players")
    expect("Clear the board", "POST /api/game/reset", None, [], state["board"], json_path="$.state.board")
    expect("Keep reset event fields consistent", "POST /api/game/reset", None, state["event_log"][-1], state["last_event"], json_path="$.state.last_event and $.state.event_log[-1]")
