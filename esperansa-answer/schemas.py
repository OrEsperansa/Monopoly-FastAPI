from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field


class ApiModel(BaseModel):
    model_config = ConfigDict(validate_assignment=True)


class CreateGameRequest(ApiModel):
    player_names: list[str]


class PlayerState(ApiModel):
    id: int
    name: str
    money: int = 1500
    position: int = 0
    is_bankrupt: bool = False
    owned_tile_ids: list[int] = Field(default_factory=list)

    def remove_balance(self, amount: int) -> None:
        if amount < 0:
            raise ValueError("The amount removed from a player cannot be negative.")

        self.money -= amount
        if self.money < 0:
            self.is_bankrupt = True


class TileState(ApiModel):
    id: int
    name: str


class StartTileState(TileState):
    type: Literal["start"] = "start"


class PropertyTileState(TileState):
    type: Literal["property"] = "property"
    price: int
    rent: int
    owner_id: int | None = None


class RewardTileState(TileState):
    type: Literal["reward"] = "reward"
    amount: int


class PenaltyTileState(TileState):
    type: Literal["penalty"] = "penalty"
    amount: int


class SurpriseTileState(TileState):
    type: Literal["surprise"] = "surprise"


BoardTileState = Annotated[
    StartTileState
    | PropertyTileState
    | RewardTileState
    | PenaltyTileState
    | SurpriseTileState,
    Field(discriminator="type"),
]


class GameState(ApiModel):
    status: Literal["not_started", "active", "finished"] = "active"
    current_player_id: int | None
    winner_id: int | None = None
    available_actions: list[Literal["roll", "buy", "end_turn"]]
    players: list[PlayerState]
    board: list[BoardTileState]
    last_event: str | None = None
    event_log: list[str] = Field(default_factory=list)


class ActionResponse(ApiModel):
    state: GameState
