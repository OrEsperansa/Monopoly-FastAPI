import subprocess

from fastapi.testclient import TestClient

import app


client = TestClient(app.app)


def test_lists_eight_distinct_checkpoints():
    response = client.get("/api/checkpoints")
    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == list(range(1, 9))


def test_runs_only_the_selected_exercise_by_default(monkeypatch):
    def fake_run(command, **_kwargs):
        assert "exercise_04" in " ".join(command)
        assert "exercise_03" not in " ".join(command)
        return subprocess.CompletedProcess(command, 0, stdout="3 passed in 0.20s\n", stderr="")

    monkeypatch.setattr(app.subprocess, "run", fake_run)
    response = client.post(
        "/api/checkpoints/4/run",
        json={"api_url": "http://localhost:8123", "cumulative": False},
    )
    assert response.status_code == 200
    assert response.json()["passed"] is True
    assert response.json()["passed_tests"] == 3
