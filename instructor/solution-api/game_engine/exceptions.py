class GameError(Exception):
    """Base exception for domain errors that the API can convert to JSON."""

    status_code = 400

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class GameNotFoundError(GameError):
    status_code = 404


class InvalidActionError(GameError):
    status_code = 409
