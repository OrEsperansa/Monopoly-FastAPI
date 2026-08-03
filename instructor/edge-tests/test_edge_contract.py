from conftest import create_game, end_turn, roll


def test_passing_start_adds_exactly_200(api):
    create_game(api)
    for first_roll, second_roll in [(5, 2), (4, 2), (4, 2)]:
        roll(api, first_roll)
        end_turn(api)
        roll(api, second_roll)
        end_turn(api)

    before = api.get("/api/game").json()
    player = next(item for item in before["players"] if item["id"] == 1)
    assert player["position"] == 13
    money_before = player["money"]

    after = roll(api, 3)
    player = next(item for item in after["players"] if item["id"] == 1)
    assert player["position"] == 0
    assert player["money"] == money_before + 200


def test_non_numeric_test_roll_is_422_without_mutation(api):
    before = create_game(api)
    response = api.post("/api/game/roll", headers={"X-Test-Dice-Roll": "three"})
    assert response.status_code == 422
    assert api.get("/api/game").json() == before
