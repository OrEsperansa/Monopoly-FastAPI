# Property Empire Classroom

Property Empire Classroom is a teaching project with two independent applications:

- `student-api`: a FastAPI backend and pure Python game engine.
- `shared-ui`: a React + Vite frontend that talks to the backend only through HTTP.

The architecture is intentionally strict:

```text
React UI
   |
 HTTP
   |
FastAPI
   |
Pure Python Game Engine
```

The React app never calculates game rules. FastAPI routes never contain business logic. The game engine imports no FastAPI code and can be tested as plain Python.

## Run The Backend

```bash
cd student-api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Run The Frontend

```bash
cd shared-ui
npm install
npm run dev
```

Open the Vite URL and enter an API URL such as `http://localhost:8000` or a classroom LAN address like `http://192.168.x.x:8000`.

## Test

```bash
cd student-api
pytest
```

```bash
cd shared-ui
npm run build
```

## Run With Docker

Build and start both applications:

```bash
docker compose up --build
```

Open the UI at `http://localhost:5173` and use
`http://localhost:8000` as the API URL. Published images are available as:

- `oresperansa/monopoly-fastapi-api:latest`
- `oresperansa/monopoly-fastapi-ui:latest`
