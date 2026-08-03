from conftest import create_game, roll


def test_header_makes_dice_roll_deterministic(api):
    state = create_game(api)
    moved = roll(api, 3)
    assert moved["players"][0]["position"] == 3
    assert moved["players"][1]["position"] == state["players"][1]["position"]
    assert any("rolled 3" in event for event in moved["event_log"])


def test_invalid_test_roll_is_422_and_does_not_change_state(api):
    before = create_game(api)
    response = api.post("/api/game/roll", headers={"X-Test-Dice-Roll": "7"})
    assert response.status_code == 422
    assert api.get("/api/game").json() == before


def test_roll_cannot_be_repeated_in_one_turn(api):
    create_game(api)
    roll(api, 3)
    before = api.get("/api/game").json()
    response = api.post("/api/game/roll", headers={"X-Test-Dice-Roll": "2"})
    assert response.status_code == 409
    assert api.get("/api/game").json() == before
