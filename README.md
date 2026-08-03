# Property Empire Classroom

Property Empire Classroom is a backend-recreation exercise with two independent applications:

- `student-api`: dependency-only starting point for the student's FastAPI backend.
- `shared-ui`: a React + Vite frontend that talks to the backend only through HTTP.
- `student-tests`: cumulative black-box HTTP checkpoints.
- `instructor`: clearly labeled reference solution, edge tests, and Hebrew teaching guide.

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

## Start the Exercise

```bash
cd student-api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Read `docs/student-backend-exercises-he/01_health_check.docx`, create your ASGI application, and start it on any free port:

```bash
set PROPERTY_EMPIRE_TESTING=1
uvicorn <your_module>:app --reload --port 8123
```

Run the matching cumulative checkpoint from the repository root:

```bash
python student-tests/run_checkpoint.py 1 --api-url http://localhost:8123
```

## Run The Frontend

```bash
cd shared-ui
npm install
npm run dev
```

Open the Vite URL and enter the student's API URL. The UI only displays server data and sends API requests; it contains no game rules.

## Test

```bash
cd instructor/solution-api
pytest
```

```bash
cd shared-ui
npm run build
```

## Run With Docker

Run the published reference images. Override either host port if it is occupied:

```bash
$env:API_PORT=8123
$env:UI_PORT=5174
docker compose up
```

Open the UI at `http://localhost:5174` and use `http://localhost:8123` as the API URL.

Instructors can build the local solution with `docker compose -f instructor/docker-compose.yml up --build`. Published images are:

- `oresperansa/monopoly-fastapi-api:latest`
- `oresperansa/monopoly-fastapi-ui:latest`
