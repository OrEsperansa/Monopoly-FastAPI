from dataclasses import dataclass

from .tile import Tile, TileType


@dataclass
class SurpriseTile(Tile):
    def __init__(self, id: int, name: str = "Surprise") -> None:
        super().__init__(id=id, name=name, type=TileType.SURPRISE)
