from dataclasses import dataclass
from enum import Enum


class TileType(str, Enum):
    START = "start"
    PROPERTY = "property"
    REWARD = "reward"
    PENALTY = "penalty"
    SURPRISE = "surprise"


@dataclass
class Tile:
    """The fields shared by every tile on the board."""

    id: int
    name: str
    type: TileType

    def to_dict(self) -> dict:
        """Convert the tile to the JSON-compatible API representation."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type.value,
        }
