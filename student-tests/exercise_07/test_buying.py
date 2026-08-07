from conftest import action_state, create_game, expect, fail_check, roll


def test_buying_updates_money_and_both_ownership_views(api):
    for _ in range(40):
        create_game(api)
        landed = roll(api)
        if "buy" not in landed["available_actions"]:
            continue

        buyer_before = next(player for player in landed["players"] if player["id"] == landed["current_player_id"])
        tile = landed["board"][buyer_before["position"]]
        bought = action_state(api.post("/api/game/buy"))
        buyer = next(player for player in bought["players"] if player["id"] == bought["current_player_id"])
        context = {"landed_tile": tile, "buyer_before": buyer_before}
        expect("Deduct the property price", "POST /api/game/buy", None, buyer_before["money"] - tile["price"], buyer["money"], json_path=f"$.state.players[id={buyer['id']}].money", calculation_context=context)
        expect("Add the property to the player's holdings", "POST /api/game/buy", None, f"owned_tile_ids containing {tile['id']}", buyer["owned_tile_ids"], lambda result: tile["id"] in result, json_path=f"$.state.players[id={buyer['id']}].owned_tile_ids", calculation_context=context)
        expect("Assign the board tile owner", "POST /api/game/buy", None, buyer["id"], bought["board"][tile["id"]]["owner_id"], json_path=f"$.state.board[{tile['id']}].owner_id", calculation_context=context)
        expect("Only allow ending the turn after buying", "POST /api/game/buy", None, ["end_turn"], bought["available_actions"], json_path="$.state.available_actions", calculation_context=context)
        return
    fail_check("Buy an available property", "POST /api/game/buy", None, "A purchasable property landing", "No buy action became available", calculation_context={"new_games_checked": 40})


def test_buy_is_rejected_when_not_available_without_mutation(api):
    before = create_game(api)
    response = api.post("/api/game/buy")
    expect("Reject buying when unavailable", "POST /api/game/buy", None, 409, response.status_code)
    expect("Explain a rejected purchase", "POST /api/game/buy", None, "An error message", response.json(), lambda body: "detail" in body, json_path="$.detail")
    expect("Rejected purchase does not mutate state", "GET /api/game", None, before, api.get("/api/game").json(), json_path="$", calculation_context={"previous_action": "An unavailable buy request"})
