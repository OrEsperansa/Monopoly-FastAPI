from dataclasses import dataclass

from .tile import Tile, TileType


@dataclass
class PropertyTile(Tile):
    price: int
    rent: int
    owner_id: int | None = None

    def __init__(
        self,
        id: int,
        name: str,
        price: int,
        rent: int,
        owner_id: int | None = None,
    ) -> None:
        super().__init__(id=id, name=name, type=TileType.PROPERTY)
        self.price = price
        self.rent = rent
        self.owner_id = owner_id

    def to_dict(self) -> dict:
        data = super().to_dict()
        data.update({
            "price": self.price,
            "rent": self.rent,
            "owner_id": self.owner_id,
        })
        return data
