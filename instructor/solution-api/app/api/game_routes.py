import os
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException

from app.dependencies import get_game_service
from app.schemas.game_schemas import ActionResponse, CreateGameRequest, GameStateResponse, HealthResponse
from game_engine.services.game_service import GameService


router = APIRouter()


def parse_test_roll(raw_value: str) -> int:
    if not raw_value.isdigit():
        raise HTTPException(status_code=422, detail="Test dice roll must be 1 to 6.")
    value = int(raw_value)
    if value not in range(1, 7):
        raise HTTPException(status_code=422, detail="Test dice roll must be 1 to 6.")
    return value


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@router.post("/game", response_model=GameStateResponse)
def create_game(
    request: CreateGameRequest,
    service: GameService = Depends(get_game_service),
) -> GameStateResponse:
    # Routes validate HTTP input, call services, and return response models.
    # They deliberately contain no game rules.
    return GameStateResponse.model_validate(service.create_game(request.player_names).to_dict())


@router.get("/game", response_model=GameStateResponse)
def get_game(service: GameService = Depends(get_game_service)) -> GameStateResponse:
    return GameStateResponse.model_validate(service.get_game().to_dict())


@router.post("/game/roll", response_model=ActionResponse)
def roll(
    service: GameService = Depends(get_game_service),
    x_test_dice_roll: Optional[str] = Header(default=None),
) -> ActionResponse:
    forced_roll = None
    testing = os.getenv("PROPERTY_EMPIRE_TESTING") == "1"
    if testing and x_test_dice_roll is not None:
        forced_roll = parse_test_roll(x_test_dice_roll)
    return ActionResponse(state=GameStateResponse.model_validate(service.roll(forced_roll=forced_roll).to_dict()))


@router.post("/game/buy", response_model=ActionResponse)
def buy(service: GameService = Depends(get_game_service)) -> ActionResponse:
    return ActionResponse(state=GameStateResponse.model_validate(service.buy().to_dict()))


@router.post("/game/end-turn", response_model=ActionResponse)
def end_turn(service: GameService = Depends(get_game_service)) -> ActionResponse:
    return ActionResponse(state=GameStateResponse.model_validate(service.end_turn().to_dict()))


@router.post("/game/reset", response_model=ActionResponse)
def reset(service: GameService = Depends(get_game_service)) -> ActionResponse:
    return ActionResponse(state=GameStateResponse.model_validate(service.reset().to_dict()))
