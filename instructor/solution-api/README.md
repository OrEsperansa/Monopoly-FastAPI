# Instructor Reference API

This is the complete FastAPI reference backend for Sigit Empire Classroom. It is kept outside the dependency-only student starter.

## Architecture

The backend has two separate parts:

- `app`: FastAPI routes, Pydantic schemas, dependency injection, and exception handlers.
- `game_engine`: pure Python models, services, repository, factory, and domain exceptions.

Routes only validate HTTP input, call `GameService`, and return response models. All game rules live in the service layer.

## Folder Structure

```text
app/
  main.py
  api/
  schemas/
  dependencies.py
  exception_handlers.py

game_engine/
  models/
  services/
  repositories/
  factories/
  exceptions.py

tests/
```

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Test

```bash
pytest
```

Unit tests monkeypatch `DiceService`. HTTP checkpoints start the API with `PROPERTY_EMPIRE_TESTING=1` and can send `X-Test-Dice-Roll: 1..6`; invalid values return 422 without changing state. The header is ignored when test mode is disabled.

## API Contract

- `GET /api/health`
- `POST /api/game`
- `GET /api/game`
- `POST /api/game/roll`
- `POST /api/game/buy`
- `POST /api/game/end-turn`
- `POST /api/game/reset`

Every game response returns the full state:

- status
- current player id
- winner id
- available actions
- players
- board
- last event
- event log

## Why Pydantic

Pydantic models define the JSON contract between backend and frontend. They validate incoming requests and guarantee predictable response shapes for the shared UI.

## Why Inheritance

Tiles share a common base class with `id`, `name`, and `type`. Specific tiles such as `PropertyTile`, `RewardTile`, and `PenaltyTile` inherit from that base and add only the data they need. This gives students a concrete, readable example of inheritance and polymorphism.

## Patterns Used

- Repository Pattern: stores the single active in-memory game.
- Factory Pattern: creates the board.
- Service Layer: contains business rules and use-case orchestration.

No database, authentication, or frontend coupling is included.
