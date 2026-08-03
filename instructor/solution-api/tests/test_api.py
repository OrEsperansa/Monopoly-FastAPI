import random

from app.dependencies import get_game_service
from game_engine.models.tile import PenaltyTile, RewardTile
from tests.conftest import create_game


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_game(client):
    state = create_game(client, ["Ada", "Linus", "Grace"])
    assert state["status"] == "active"
    assert state["current_player_id"] == 1
    assert state["available_actions"] == ["roll"]
    assert len(state["players"]) == 3
    assert len(state["board"]) == 16


def test_validation_rejects_bad_player_names(client):
    assert client.post("/api/game", json={"player_names": ["Ada"]}).status_code == 422
    assert client.post("/api/game", json={"player_names": ["Ada", ""]}).status_code == 422
    assert client.post("/api/game", json={"player_names": ["Ada", "ada"]}).status_code == 422


def test_roll_is_deterministic_with_monkeypatched_dice(client, monkeypatch):
    create_game(client)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 3)

    response = client.post("/api/game/roll")

    assert response.status_code == 200
    state = response.json()["state"]
    assert state["players"][0]["position"] == 3
    assert state["available_actions"] == ["buy", "end_turn"]


def test_test_dice_header_is_deterministic_when_enabled(client, monkeypatch):
    create_game(client)
    monkeypatch.setenv("PROPERTY_EMPIRE_TESTING", "1")
    response = client.post("/api/game/roll", headers={"X-Test-Dice-Roll": "3"})
    assert response.status_code == 200
    assert response.json()["state"]["players"][0]["position"] == 3


def test_invalid_test_dice_header_does_not_mutate_state(client, monkeypatch):
    before = create_game(client)
    monkeypatch.setenv("PROPERTY_EMPIRE_TESTING", "1")
    response = client.post("/api/game/roll", headers={"X-Test-Dice-Roll": "7"})
    assert response.status_code == 422
    assert client.get("/api/game").json() == before


def test_test_dice_header_is_ignored_when_test_mode_is_disabled(client, monkeypatch):
    create_game(client)
    monkeypatch.delenv("PROPERTY_EMPIRE_TESTING", raising=False)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 2)
    response = client.post("/api/game/roll", headers={"X-Test-Dice-Roll": "invalid"})
    assert response.status_code == 200
    assert response.json()["state"]["players"][0]["position"] == 2


def test_movement_and_passing_start(client, monkeypatch):
    create_game(client)
    service = get_game_service()
    game = service.get_game()
    game.players[0].position = 14
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 3)

    state = client.post("/api/game/roll").json()["state"]

    assert state["players"][0]["position"] == 1
    assert state["players"][0]["money"] == 1700


def test_buy_property(client, monkeypatch):
    create_game(client)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 1)
    client.post("/api/game/roll")

    state = client.post("/api/game/buy").json()["state"]

    assert state["players"][0]["money"] == 1400
    assert state["players"][0]["owned_tile_ids"] == [1]
    assert state["board"][1]["owner_id"] == 1
    assert state["available_actions"] == ["end_turn"]


def test_rent_payment(client, monkeypatch):
    create_game(client)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 1)
    client.post("/api/game/roll")
    client.post("/api/game/buy")
    client.post("/api/game/end-turn")
    client.post("/api/game/roll")

    state = client.post("/api/game/end-turn").json()["state"]

    assert state["players"][0]["money"] == 1420
    assert state["players"][1]["money"] == 1480


def test_reward_tile(client, monkeypatch):
    create_game(client)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 2)

    state = client.post("/api/game/roll").json()["state"]

    assert state["players"][0]["position"] == 2
    assert state["players"][0]["money"] == 1600
    assert state["available_actions"] == ["end_turn"]


def test_penalty_tile(client, monkeypatch):
    create_game(client)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 4)

    state = client.post("/api/game/roll").json()["state"]

    assert state["players"][0]["position"] == 4
    assert state["players"][0]["money"] == 1400
    assert state["available_actions"] == ["end_turn"]


def test_surprise_tile(client, monkeypatch):
    create_game(client)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 6)
    monkeypatch.setattr(random, "choice", lambda effects: "gain_100")

    state = client.post("/api/game/roll").json()["state"]

    assert state["players"][0]["position"] == 6
    assert state["players"][0]["money"] == 1600
    assert state["available_actions"] == ["end_turn"]


def test_turn_rotation(client, monkeypatch):
    create_game(client, ["Ada", "Linus", "Grace"])
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 2)
    client.post("/api/game/roll")

    state = client.post("/api/game/end-turn").json()["state"]

    assert state["current_player_id"] == 2
    assert state["available_actions"] == ["roll"]


def test_bankrupt_players_are_skipped(client):
    create_game(client, ["Ada", "Linus", "Grace"])
    service = get_game_service()
    game = service.get_game()
    game.players[1].is_bankrupt = True
    game.available_actions = ["end_turn"]

    state = client.post("/api/game/end-turn").json()["state"]

    assert state["current_player_id"] == 3


def test_bankruptcy(client, monkeypatch):
    create_game(client)
    service = get_game_service()
    game = service.get_game()
    game.board[1] = PenaltyTile(1, "Huge Fine", amount=2000)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 1)

    state = client.post("/api/game/roll").json()["state"]

    assert state["players"][0]["is_bankrupt"] is True


def test_winner(client, monkeypatch):
    create_game(client)
    service = get_game_service()
    game = service.get_game()
    game.board[1] = PenaltyTile(1, "Huge Fine", amount=2000)
    monkeypatch.setattr("game_engine.services.dice_service.DiceService.roll", lambda self: 1)

    state = client.post("/api/game/roll").json()["state"]

    assert state["status"] == "finished"
    assert state["winner_id"] == 2
    assert state["available_actions"] == []


def test_reset(client):
    create_game(client)

    state = client.post("/api/game/reset").json()["state"]

    assert state["status"] == "not_started"
    assert state["players"] == []
    assert state["board"] == []
