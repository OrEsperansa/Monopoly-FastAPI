# Docker Release Bundle

This folder runs the latest published Sigit Empire classroom images without building source code locally.

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

Docker image archives are intentionally not committed to Git: they are large binary files and do not receive useful Git deltas. This release bundle pulls the exact published images from Docker Hub instead.
