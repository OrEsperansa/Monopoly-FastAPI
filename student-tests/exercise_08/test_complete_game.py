from conftest import action_state, create_game, roll


def _distance(position, tile_id):
    return (tile_id - position) % 16


def _choose_roll(state, player_id):
    player = next(item for item in state["players"] if item["id"] == player_id)
    reachable = [(tile, _distance(player["position"], tile["id"])) for tile in state["board"]]
    reachable = [(tile, distance) for tile, distance in reachable if 1 <= distance <= 6]

    if player_id == 1:
        unowned = [(tile, distance) for tile, distance in reachable
                   if tile["type"] == "property" and tile["owner_id"] is None and tile["price"] <= player["money"]]
        if unowned:
            return min(unowned, key=lambda item: item[1])[1]
        safe = [(tile, distance) for tile, distance in reachable
                if tile["type"] == "property" and tile["owner_id"] == 1]
        return min(safe or reachable, key=lambda item: item[1])[1]

    rent = [(tile, distance) for tile, distance in reachable
            if tile["type"] == "property" and tile["owner_id"] == 1]
    if rent:
        return min(rent, key=lambda item: item[1])[1]
    return 1


def test_game_can_reach_bankruptcy_and_a_winner(api):
    state = create_game(api)
    for _ in range(1300):
        current = state["current_player_id"]
        state = roll(api, _choose_roll(state, current))
        if state["status"] == "finished":
            break
        if current == 1 and "buy" in state["available_actions"]:
            state = action_state(api.post("/api/game/buy"))
        state = action_state(api.post("/api/game/end-turn"))

    assert state["status"] == "finished"
    assert state["winner_id"] == 1
    assert state["available_actions"] == []
    assert next(player for player in state["players"] if player["id"] == 2)["is_bankrupt"] is True


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
