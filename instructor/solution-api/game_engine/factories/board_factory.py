from game_engine.models.tile import PenaltyTile, PropertyTile, RewardTile, StartTile, SurpriseTile, Tile


class BoardFactory:
    """Factory Pattern: one class owns board creation.

    If the classroom wants a larger board later, callers do not need to know
    which concrete Tile subclasses should be constructed.
    """

    def create_board(self) -> list[Tile]:
        return [
            StartTile(0),
            PropertyTile(1, "Bakery", price=100, rent=20),
            RewardTile(2, "Good Day", amount=100),
            PropertyTile(3, "Toy Store", price=120, rent=24),
            PenaltyTile(4, "Tax", amount=100),
            PropertyTile(5, "Pizza Shop", price=140, rent=28),
            SurpriseTile(6),
            PropertyTile(7, "Book Store", price=160, rent=32),
            RewardTile(8, "Bonus", amount=150),
            PropertyTile(9, "Clothing Store", price=180, rent=36),
            PenaltyTile(10, "Fine", amount=75),
            PropertyTile(11, "Coffee Shop", price=200, rent=40),
            RewardTile(12, "Treasure", amount=200),
            PropertyTile(13, "Electronics", price=220, rent=44),
            SurpriseTile(14),
            PenaltyTile(15, "Luxury Tax", amount=150),
        ]
