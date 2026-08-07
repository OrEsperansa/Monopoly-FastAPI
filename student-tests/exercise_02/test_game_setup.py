from conftest import GAME_STATE_KEYS, create_game, expect


def test_create_returns_the_initial_game_contract(api):
    created = create_game(api, ["Ada", "Linus", "Grace"])
    payload = {"player_names": ["Ada", "Linus", "Grace"]}
    expect("Initial game status", "POST /api/game", payload, "active", created["status"], json_path="$.status")
    expect("First player starts", "POST /api/game", payload, 1, created["current_player_id"], json_path="$.current_player_id")
    expect("A new game has no winner", "POST /api/game", payload, None, created["winner_id"], json_path="$.winner_id")
    expect("A new game allows rolling", "POST /api/game", payload, ["roll"], created["available_actions"], json_path="$.available_actions")
    expect("Create every requested player", "POST /api/game", payload, 3, len(created["players"]), json_path="$.players")
    expect("Create a 16-tile board", "POST /api/game", payload, 16, len(created["board"]), json_path="$.board")
    expect("Return every game-state field", "POST /api/game", payload, sorted(GAME_STATE_KEYS), sorted(created), json_path="$")


def test_players_begin_with_expected_values(api):
    state = create_game(api)
    payload = {"player_names": ["Ada", "Linus"]}
    expect("Assign ordered player IDs", "POST /api/game", payload, [(1, "Ada"), (2, "Linus")], [(player["id"], player["name"]) for player in state["players"]], json_path="$.players[*].id and $.players[*].name")
    for index, player in enumerate(state["players"]):
        expect("Initial player money", "POST /api/game", payload, 1500, player["money"], json_path=f"$.players[{index}].money")
        expect("Initial player position", "POST /api/game", payload, 0, player["position"], json_path=f"$.players[{index}].position")
        expect("Initial bankruptcy state", "POST /api/game", payload, False, player["is_bankrupt"], json_path=f"$.players[{index}].is_bankrupt")
        expect("Initial property ownership", "POST /api/game", payload, [], player["owned_tile_ids"], json_path=f"$.players[{index}].owned_tile_ids")
    expect("Start tile ID", "POST /api/game", payload, 0, state["board"][0]["id"], json_path="$.board[0].id")
    expect("Start tile type", "POST /api/game", payload, "start", state["board"][0]["type"], json_path="$.board[0].type")


def test_create_validates_and_normalizes_player_names(api):
    invalid_names = [["Ada"], ["A", "B", "C", "D", "E"], ["Ada", ""], ["Ada", "ada"]]
    for names in invalid_names:
        payload = {"player_names": names}
        response = api.post("/api/game", json=payload)
        expect("Reject invalid player names", "POST /api/game", payload, 422, response.status_code)
        expect("Return validation details", "POST /api/game", payload, "A validation error message", response.json(), lambda body: "detail" in body, json_path="$.detail")

    state = create_game(api, ["  Ada  ", " Linus"])
    expect("Trim player names", "POST /api/game", {"player_names": ["  Ada  ", " Linus"]}, ["Ada", "Linus"], [player["name"] for player in state["players"]], json_path="$.players[*].name")
