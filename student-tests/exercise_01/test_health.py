from conftest import expect


def test_health_contract(api):
    response = api.get("/api/health")
    expect("Health endpoint status", "GET /api/health", None, 200, response.status_code)
    expect("Health endpoint content type", "GET /api/health", None, "application/json", response.headers.get("content-type", ""), lambda value: value.startswith("application/json"))
    expect("Health endpoint JSON body", "GET /api/health", None, {"status": "ok"}, response.json(), json_path="$")
