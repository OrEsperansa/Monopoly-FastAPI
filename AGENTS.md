# Repository Guidelines

## Project Structure & Module Organization

This repository contains two independent applications. `student-api/` is the FastAPI backend; HTTP routes and Pydantic schemas live under `app/`, while framework-independent rules live under `game_engine/` in `models/`, `services/`, `repositories/`, and `factories/`. Backend tests are in `student-api/tests/`. `shared-ui/` is a React, TypeScript, and Vite client, with application code in `src/` and reusable UI pieces in `src/components/`. Supporting classroom materials are in `docs/`, and document-generation utilities are in `scripts/`.

Keep the architecture boundary strict: the UI communicates through HTTP, routes delegate to services, and `game_engine` must not import FastAPI.

## Build, Test, and Development Commands

Run backend commands from `student-api/`:

- `python -m venv .venv` creates a local virtual environment.
- `.venv\Scripts\activate` activates it on Windows.
- `pip install -r requirements.txt` installs API and test dependencies.
- `uvicorn app.main:app --reload` starts the API at `http://localhost:8000`.
- `pytest` runs the backend test suite.

Run frontend commands from `shared-ui/`:

- `npm install` installs locked dependencies.
- `npm run dev` starts Vite on port 5173.
- `npm run build` type-checks TypeScript and creates the production bundle.
- `npm run preview` serves the built bundle locally.

## Coding Style & Naming Conventions

Follow existing formatting: four-space indentation and `snake_case` for Python functions/modules, `PascalCase` for Python classes and React components, and `camelCase` for TypeScript variables. Name component files after their exported component, for example `GameBoard.tsx`. Prefer type annotations and small service methods. No formatter or linter is configured, so match nearby code and keep imports organized.

## Testing Guidelines

Tests use `pytest`, FastAPI's test client, fixtures from `tests/conftest.py`, and monkeypatching for deterministic dice behavior. Name files `test_*.py` and tests `test_<behavior>`. Add coverage for success, validation, state transitions, and domain edge cases. There is no formal coverage threshold; every rule change should include focused tests. Run `pytest` and `npm run build` before submitting.

## Commit & Pull Request Guidelines

Recent commits use short, imperative subjects such as `Add interactive board selection`. Keep each commit focused and avoid unrelated generated files. Pull requests should explain the behavioral change, identify affected API or UI areas, list verification commands, and link relevant issues. Include screenshots for visible UI changes and document any API contract changes.
