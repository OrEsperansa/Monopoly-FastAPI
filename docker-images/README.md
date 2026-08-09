# Complete Docker Images

This directory contains complete, uncompressed archives produced with `docker save` from the Sigit Empire `2026-08-08` images. Each archive includes both the `2026-08-08` and `latest` tags:

- `monopoly-fastapi-api-latest.tar`
- `monopoly-fastapi-ui-latest.tar`
- `monopoly-fastapi-test-runner-latest.tar`

Load the images into Docker before starting the bundled Compose configuration:

```bash
docker load --input docker-images/monopoly-fastapi-api-latest.tar
docker load --input docker-images/monopoly-fastapi-ui-latest.tar
docker load --input docker-images/monopoly-fastapi-test-runner-latest.tar
docker compose up -d
```

Use `Get-FileHash docker-images/*.tar -Algorithm SHA256` on PowerShell, or `sha256sum docker-images/*.tar` on Linux, to compare the archives with `SHA256SUMS`.
