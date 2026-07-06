from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


ActionName = Literal["roll", "buy", "end_turn"]
GameStatus = Literal["not_started", "active", "finished"]
TileType = Literal["start", "property", "reward", "penalty", "surprise"]


class HealthResponse(BaseModel):
    status: str = "ok"


class CreateGameRequest(BaseModel):
    """Request body for starting a new game.

    Pydantic validates incoming JSON before the route calls the service layer.
    This guarantees the contract shared by backend and frontend.
    """

    player_names: list[str] = Field(min_length=2, max_length=4)

    @field_validator("player_names")
    @classmethod
    def names_must_not_be_blank(cls, value: list[str]) -> list[str]:
        for name in value:
            if not name.strip():
                raise ValueError("Player names cannot be empty.")
        return [name.strip() for name in value]

    @model_validator(mode="after")
    def names_must_be_unique(self) -> "CreateGameRequest":
        normalized = [name.lower() for name in self.player_names]
        if len(normalized) != len(set(normalized)):
            raise ValueError("Player names must be unique.")
        return self


class PlayerResponse(BaseModel):
    id: int
    name: str
    money: int
    position: int
    is_bankrupt: bool
    owned_tile_ids: list[int]


class TileResponse(BaseModel):
    id: int
    name: str
    type: TileType
    price: int | None = None
    rent: int | None = None
    owner_id: int | None = None
    amount: int | None = None


class GameStateResponse(BaseModel):
    status: GameStatus
    current_player_id: int | None
    winner_id: int | None
    available_actions: list[ActionName]
    players: list[PlayerResponse]
    board: list[TileResponse]
    last_event: str | None
    event_log: list[str]


class ActionResponse(BaseModel):
    state: GameStateResponse
