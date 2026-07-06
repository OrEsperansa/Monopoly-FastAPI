from dataclasses import dataclass, field


@dataclass
class Player:
    """A player is a simple domain object owned by the game engine."""

    id: int
    name: str
    money: int = 1500
    position: int = 0
    is_bankrupt: bool = False
    owned_tile_ids: list[int] = field(default_factory=list)

    def change_money(self, amount: int) -> None:
        self.money += amount
        if self.money < 0:
            self.is_bankrupt = True

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "money": self.money,
            "position": self.position,
            "is_bankrupt": self.is_bankrupt,
            "owned_tile_ids": self.owned_tile_ids,
        }
