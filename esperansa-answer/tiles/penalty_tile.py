from dataclasses import dataclass

from .tile import Tile, TileType


@dataclass
class PenaltyTile(Tile):
    amount: int

    def __init__(self, id: int, name: str, amount: int) -> None:
        super().__init__(id=id, name=name, type=TileType.PENALTY)
        self.amount = amount

    def to_dict(self) -> dict:
        data = super().to_dict()
        data["amount"] = self.amount
        return data
