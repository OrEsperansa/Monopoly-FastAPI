import pytest

from conftest import action_state, create_game, roll


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
        assert buyer["money"] == buyer_before["money"] - tile["price"]
        assert tile["id"] in buyer["owned_tile_ids"]
        assert bought["board"][tile["id"]]["owner_id"] == buyer["id"]
        assert bought["available_actions"] == ["end_turn"]
        return
    pytest.fail("Did not land on a purchasable property within 40 games.")


def test_buy_is_rejected_when_not_available_without_mutation(api):
    before = create_game(api)
    response = api.post("/api/game/buy")
    assert response.status_code == 409
    assert "detail" in response.json()
    assert api.get("/api/game").json() == before
