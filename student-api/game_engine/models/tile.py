from dataclasses import dataclass
from typing import Literal


TileType = Literal["start", "property", "reward", "penalty", "surprise"]


@dataclass
class Tile:
    """Base class for all board tiles.

    This teaches inheritance: each specific tile type shares the common
    id/name/type shape while adding only the data it needs.
    """

    id: int
    name: str
    type: TileType

    def to_dict(self) -> dict:
        return {"id": self.id, "name": self.name, "type": self.type}


@dataclass
class StartTile(Tile):
    def __init__(self, id: int, name: str = "Start") -> None:
        super().__init__(id=id, name=name, type="start")


@dataclass
class PropertyTile(Tile):
    price: int
    rent: int
    owner_id: int | None = None

    def __init__(self, id: int, name: str, price: int, rent: int) -> None:
        super().__init__(id=id, name=name, type="property")
        self.price = price
        self.rent = rent
        self.owner_id = None

    def to_dict(self) -> dict:
        data = super().to_dict()
        data.update({"price": self.price, "rent": self.rent, "owner_id": self.owner_id})
        return data


@dataclass
class RewardTile(Tile):
    amount: int

    def __init__(self, id: int, name: str, amount: int) -> None:
        super().__init__(id=id, name=name, type="reward")
        self.amount = amount

    def to_dict(self) -> dict:
        data = super().to_dict()
        data.update({"amount": self.amount})
        return data


@dataclass
class PenaltyTile(Tile):
    amount: int

    def __init__(self, id: int, name: str, amount: int) -> None:
        super().__init__(id=id, name=name, type="penalty")
        self.amount = amount

    def to_dict(self) -> dict:
        data = super().to_dict()
        data.update({"amount": self.amount})
        return data


@dataclass
class SurpriseTile(Tile):
    def __init__(self, id: int, name: str = "Surprise") -> None:
        super().__init__(id=id, name=name, type="surprise")
