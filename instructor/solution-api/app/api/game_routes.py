from fastapi import APIRouter, Depends

from app.dependencies import get_game_service
from app.schemas.game_schemas import ActionResponse, CreateGameRequest, GameStateResponse, HealthResponse
from game_engine.services.game_service import GameService


router = APIRouter()


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
) -> ActionResponse:
    return ActionResponse(state=GameStateResponse.model_validate(service.roll().to_dict()))


@router.post("/game/buy", response_model=ActionResponse)
def buy(service: GameService = Depends(get_game_service)) -> ActionResponse:
    return ActionResponse(state=GameStateResponse.model_validate(service.buy().to_dict()))


@router.post("/game/end-turn", response_model=ActionResponse)
def end_turn(service: GameService = Depends(get_game_service)) -> ActionResponse:
    return ActionResponse(state=GameStateResponse.model_validate(service.end_turn().to_dict()))


@router.post("/game/reset", response_model=ActionResponse)
def reset(service: GameService = Depends(get_game_service)) -> ActionResponse:
    return ActionResponse(state=GameStateResponse.model_validate(service.reset().to_dict()))
