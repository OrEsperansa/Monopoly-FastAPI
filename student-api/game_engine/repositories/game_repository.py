from game_engine.models.game import Game


class GameRepository:
    """Repository Pattern: hides where the current game is stored.

    This reference solution uses memory only. The service layer talks to a
    repository interface-shaped class, so students can later discuss how a
    database repository would fit without changing route code.
    """

    def __init__(self) -> None:
        self.current_game: Game | None = None

    def save(self, game: Game) -> Game:
        self.current_game = game
        return game

    def get(self) -> Game | None:
        return self.current_game

    def exists(self) -> bool:
        return self.current_game is not None

    def reset(self) -> None:
        self.current_game = None
