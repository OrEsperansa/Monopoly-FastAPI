import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


from game import GameError, GameManager, UnavailableActionError
from schemas import ActionResponse, CreateGameRequest, GameState

app = FastAPI()
game = GameManager()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/api/health')
def health_check():
    return {"status": "ok"}


@app.post("/api/game", response_model=GameState)
def create_game(request: CreateGameRequest) -> GameState:
    try:
        game_status = game.create_game(request.player_names)
        return game_status
    except GameError as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.get("/api/game", response_model=GameState)
def get_game() -> GameState:
    try:
        game_state = game.get_game()
        return game_state
    except GameError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/game/roll", response_model=ActionResponse)
def roll_dice() -> ActionResponse:
    try:
        game_state = game.roll_dice()
        return game_state
    except UnavailableActionError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except GameError as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/api/game/end-turn", response_model=ActionResponse)
def end_turn() -> ActionResponse:
    try:
        game_state = game.end_turn()
        return game_state
    except GameError as e:
        raise HTTPException(status_code=409, detail=str(e))


@app.post("/api/game/buy", response_model=ActionResponse)
def buy_property() -> ActionResponse:
    try:
        game_state = game.buy_property()
        return game_state
    except UnavailableActionError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except GameError as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/api/game/reset", response_model=ActionResponse)
def reset_game() -> ActionResponse:
    return game.reset_game()


if __name__ == "__main__":
    uvicorn.run(app, port=8000)
