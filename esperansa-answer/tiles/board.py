from .penalty_tile import PenaltyTile
from .property_tile import PropertyTile
from .reward_tile import RewardTile
from .start_tile import StartTile
from .surprise_tile import SurpriseTile
from .tile import Tile


def create_board() -> list[Tile]:
    """Create every tile in the 16-position game board."""
    return [
        StartTile(0, "Start"),
        PropertyTile(1, "Israel", price=100, rent=20),
        RewardTile(2, "Cultural Festival", amount=100),
        PropertyTile(3, "Cairo", price=120, rent=24),
        PenaltyTile(4, "Customs", amount=350),
        PropertyTile(5, "United Arab Emirates", price=140, rent=28),
        SurpriseTile(6, "Desert Surprise"),
        PropertyTile(7, "Dubai", price=160, rent=32),
        RewardTile(8, "Oil Deal", amount=150),
        PropertyTile(9, "Morocco", price=180, rent=36),
        PenaltyTile(10, "Port Tax", amount=450),
        PropertyTile(11, "Beirut", price=200, rent=40),
        RewardTile(12, "Thriving Tourism", amount=200),
        PropertyTile(13, "Doha", price=220, rent=44),
        SurpriseTile(14, "Market Surprise"),
        PenaltyTile(15, "Luxury Tax", amount=650),
    ]
