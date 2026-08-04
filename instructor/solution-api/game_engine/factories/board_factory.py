from game_engine.models.tile import PenaltyTile, PropertyTile, RewardTile, StartTile, SurpriseTile, Tile


class BoardFactory:
    """Factory Pattern: one class owns board creation.

    If the classroom wants a larger board later, callers do not need to know
    which concrete Tile subclasses should be constructed.
    """

    def create_board(self) -> list[Tile]:
        return [
            StartTile(0, "נקודת יציאה"),
            PropertyTile(1, "ירדן", price=100, rent=20),
            RewardTile(2, "פסטיבל תרבות", amount=100),
            PropertyTile(3, "קהיר", price=120, rent=24),
            PenaltyTile(4, "מכס", amount=100),
            PropertyTile(5, "איחוד האמירויות", price=140, rent=28),
            SurpriseTile(6, "הפתעה במדבר"),
            PropertyTile(7, "דובאי", price=160, rent=32),
            RewardTile(8, "עסקת נפט", amount=150),
            PropertyTile(9, "מרוקו", price=180, rent=36),
            PenaltyTile(10, "מס נמל", amount=75),
            PropertyTile(11, "ביירות", price=200, rent=40),
            RewardTile(12, "תיירות משגשגת", amount=200),
            PropertyTile(13, "דוחה", price=220, rent=44),
            SurpriseTile(14, "הפתעה בשוק"),
            PenaltyTile(15, "מס יוקרה", amount=150),
        ]
