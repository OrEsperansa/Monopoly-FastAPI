from conftest import action_state, create_game, roll


def test_buying_updates_money_and_both_ownership_views(api):
    create_game(api)
    landed = roll(api, 1)
    tile = landed["board"][1]
    assert landed["available_actions"] == ["buy", "end_turn"]
    bought = action_state(api.post("/api/game/buy"))
    buyer = bought["players"][0]
    assert buyer["money"] == 1500 - tile["price"]
    assert tile["id"] in buyer["owned_tile_ids"]
    assert bought["board"][1]["owner_id"] == buyer["id"]
    assert bought["available_actions"] == ["end_turn"]


def test_buy_is_rejected_when_not_available_without_mutation(api):
    before = create_game(api)
    response = api.post("/api/game/buy")
    assert response.status_code == 409
    assert "detail" in response.json()
    assert api.get("/api/game").json() == before
