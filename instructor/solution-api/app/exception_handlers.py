from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from game_engine.exceptions import GameError


def register_exception_handlers(app: FastAPI) -> None:
    """Translate domain exceptions into HTTP responses.

    The game engine raises plain Python exceptions. FastAPI-specific response
    formatting lives here so the engine never imports FastAPI.
    """

    @app.exception_handler(GameError)
    async def handle_game_error(request: Request, exc: GameError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})
