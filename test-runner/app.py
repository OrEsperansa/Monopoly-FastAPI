from __future__ import annotations

import asyncio
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from fastapi import FastAPI, HTTPException
from pydantic import AnyHttpUrl, BaseModel


ROOT = Path(__file__).resolve().parent
TEST_ROOT = ROOT / "student-tests"
RUN_LOCK = asyncio.Lock()

CHECKPOINTS = [
    {"id": 1, "title": "בדיקת תקינות", "feature": "החזרת תשובת JSON יציבה מ-GET /api/health."},
    {"id": 2, "title": "יצירת משחק", "feature": "בדיקת השחקנים והחזרת מצב פתיחה מלא עם 16 משבצות."},
    {"id": 3, "title": "שמירת מצב ושליפתו", "feature": "שמירת המשחק בין בקשות והחזרתו באמצעות GET /api/game."},
    {"id": 4, "title": "קובייה ותנועה", "feature": "הזזת שחקן במסלול מעגלי וחסימת זריקה חוזרת."},
    {"id": 5, "title": "סיום תור", "feature": "העברת השליטה לשחקן הבא והמשך משחק לאורך מספר תורות."},
    {"id": 6, "title": "השפעות המשבצות", "feature": "הפעלת פרס, תשלום והפתעה לאחר התנועה."},
    {"id": 7, "title": "רכישת נכס", "feature": "רכישת נכס פנוי ועדכון שתי תצוגות הבעלות."},
    {"id": 8, "title": "שכירות", "feature": "העברת שכירות בעת נחיתה על נכס של שחקן אחר."},
    {"id": 9, "title": "משחק מלא", "feature": "טיפול בפשיטת רגל, ניצחון, פעולות חסומות ואיפוס."},
]


class RunRequest(BaseModel):
    api_url: AnyHttpUrl
    cumulative: bool = False


class RunResult(BaseModel):
    checkpoint: int
    cumulative: bool
    passed: bool
    passed_tests: int
    failed_tests: int
    duration_seconds: float
    output: str


app = FastAPI(title="Sigit Empire Checkpoint Runner", docs_url=None, redoc_url=None)


def _target_url(value: str) -> str:
    """Make a browser-local API reachable from a Dockerized runner."""
    parts = urlsplit(value.rstrip("/"))
    if os.getenv("RUNNER_DOCKERIZED") == "1" and parts.hostname in {"localhost", "127.0.0.1"}:
        port = f":{parts.port}" if parts.port else ""
        return urlunsplit((parts.scheme, f"host.docker.internal{port}", parts.path, "", ""))
    return value.rstrip("/")


def _count(pattern: str, output: str) -> int:
    match = re.search(pattern, output)
    return int(match.group(1)) if match else 0


def _format_runner_failure(checkpoint: int, payload: RunRequest, output: str) -> str:
    if "Functionality tested:" in output:
        return output
    return "\n".join([
        f"Functionality tested: Run checkpoint {checkpoint} HTTP tests",
        f"Endpoint Tested: {_target_url(str(payload.api_url))}",
        f"Value inserted: cumulative={payload.cumulative}",
        "Expected return value: The selected checkpoint tests complete successfully",
        f"Got return value: {output or 'The test process failed without output'}",
    ])


def _run(checkpoint: int, payload: RunRequest) -> RunResult:
    numbers = range(1, checkpoint + 1) if payload.cumulative else [checkpoint]
    selected = [str(TEST_ROOT / f"exercise_{number:02d}") for number in numbers]
    command = [
        sys.executable,
        "-m",
        "pytest",
        "-q",
        "-p",
        "no:cacheprovider",
        *selected,
        "--api-url",
        _target_url(str(payload.api_url)),
    ]
    started = time.perf_counter()
    try:
        completed = subprocess.run(
            command,
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=90,
            check=False,
        )
        output = (completed.stdout + completed.stderr).strip()
    except subprocess.TimeoutExpired as exc:
        output = ((exc.stdout or "") + (exc.stderr or "")).strip()
        output += "\nCheckpoint stopped after 90 seconds. Check for a hanging API request."
        completed = subprocess.CompletedProcess(command, 124)

    if completed.returncode != 0:
        output = _format_runner_failure(checkpoint, payload, output)

    return RunResult(
        checkpoint=checkpoint,
        cumulative=payload.cumulative,
        passed=completed.returncode == 0,
        passed_tests=_count(r"(\d+) passed", output),
        failed_tests=_count(r"(\d+) failed", output),
        duration_seconds=round(time.perf_counter() - started, 2),
        output=output,
    )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/checkpoints")
def checkpoints() -> list[dict[str, object]]:
    return CHECKPOINTS


@app.post("/api/checkpoints/{checkpoint}/run", response_model=RunResult)
async def run_checkpoint(checkpoint: int, payload: RunRequest) -> RunResult:
    if checkpoint not in range(1, len(CHECKPOINTS) + 1):
        raise HTTPException(status_code=404, detail="Checkpoint does not exist.")
    if RUN_LOCK.locked():
        raise HTTPException(status_code=409, detail="Another checkpoint is already running.")
    async with RUN_LOCK:
        return await asyncio.to_thread(_run, checkpoint, payload)
