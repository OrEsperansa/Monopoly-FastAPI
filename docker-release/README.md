# Docker Release Bundle

This folder runs the published Sigit Empire `2026-08-08` classroom images without building source code locally. The Compose defaults use `latest`, while `.env.example` pins the dated release for reproducible classroom setup.

The bundle includes:

- `monopoly-fastapi-api`: the reference FastAPI game backend.
- `monopoly-fastapi-ui`: the shared game UI and student Test Lab.
- `monopoly-fastapi-test-runner`: the isolated HTTP checkpoint service required by the Test Lab.

## Start

From this folder, run:

```powershell
Copy-Item .env.example .env
docker compose pull
docker compose up -d
```

Open `http://localhost:5187`. The API is available at `http://localhost:8000`.

Change the ports in `.env` when a default port is occupied. The image variables may also be replaced with an immutable digest listed in `IMAGE_DIGESTS.md`.

## Stop

```powershell
docker compose down
```

Complete offline image archives are committed in `../docker-images/`. The Compose bundle pulls the current `latest` images from Docker Hub by default.
