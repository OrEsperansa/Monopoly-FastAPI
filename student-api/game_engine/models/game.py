from dataclasses import dataclass, field
from typing import Literal

from game_engine.models.player import Player
from game_engine.models.tile import Tile


GameStatus = Literal["not_started", "active", "finished"]
ActionName = Literal["roll", "buy", "end_turn"]


@dataclass
class Game:
    players: list[Player]
    board: list[Tile]
    current_player_index: int = 0
    status: GameStatus = "active"
    available_actions: list[ActionName] = field(default_factory=lambda: ["roll"])
    winner_id: int | None = None
    event_log: list[str] = field(default_factory=list)
    last_event: str | None = None

    @property
    def current_player(self) -> Player | None:
        if self.status == "finished" or not self.players:
            return None
        return self.players[self.current_player_index]

    def add_event(self, message: str) -> None:
        self.last_event = message
        self.event_log.append(message)

    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "current_player_id": self.current_player.id if self.current_player else None,
            "winner_id": self.winner_id,
            "available_actions": self.available_actions,
            "players": [player.to_dict() for player in self.players],
            "board": [tile.to_dict() for tile in self.board],
            "last_event": self.last_event,
            "event_log": self.event_log,
        }
