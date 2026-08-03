from functools import lru_cache

from game_engine.repositories.game_repository import GameRepository
from game_engine.services.dice_service import DiceService
from game_engine.services.game_service import GameService
from game_engine.services.movement_service import MovementService
from game_engine.services.tile_service import TileService
from game_engine.services.turn_service import TurnService


@lru_cache
def get_game_repository() -> GameRepository:
    """Return the single in-memory repository used by this API process."""
    return GameRepository()


def get_game_service() -> GameService:
    """Build the service layer using dependency injection.

    FastAPI routes depend on this function instead of constructing services
    inline. That keeps route files focused on HTTP and leaves business rules in
    plain Python classes that can be tested without a web server.
    """
    return GameService(
        repository=get_game_repository(),
        dice_service=DiceService(),
        movement_service=MovementService(),
        tile_service=TileService(),
        turn_service=TurnService(),
    )
