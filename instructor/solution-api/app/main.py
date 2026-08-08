from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.game_routes import router as game_router
from app.exception_handlers import register_exception_handlers


app = FastAPI(
    title="Sigit Empire Classroom API",
    description="Reference FastAPI backend for the Sigit Empire Classroom project.",
    version="1.0.0",
)

# The frontend is intentionally independent. CORS lets a local Vite app or a
# LAN classroom machine call this API over HTTP without coupling the projects.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(game_router, prefix="/api")
