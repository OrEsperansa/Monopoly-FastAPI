import subprocess

from fastapi.testclient import TestClient

import app


client = TestClient(app.app)


def test_lists_nine_distinct_checkpoints():
    response = client.get("/api/checkpoints")
    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == list(range(1, 10))


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


def test_formats_unstructured_failures_for_the_ui(monkeypatch):
    def fake_run(command, **_kwargs):
        return subprocess.CompletedProcess(command, 1, stdout="assert 500 == 200\n1 failed\n", stderr="")

    monkeypatch.setattr(app.subprocess, "run", fake_run)
    response = client.post(
        "/api/checkpoints/1/run",
        json={"api_url": "http://localhost:8123", "cumulative": False},
    )

    assert response.status_code == 200
    output = response.json()["output"]
    assert "Functionality tested:" in output
    assert "Endpoint Tested:" in output
    assert "Value inserted:" in output
    assert "Expected return value:" in output
    assert "Got return value:" in output
