from dataclasses import dataclass

from .tile import Tile, TileType


@dataclass
class StartTile(Tile):
    def __init__(self, id: int, name: str = "Start") -> None:
        super().__init__(id=id, name=name, type=TileType.START)
