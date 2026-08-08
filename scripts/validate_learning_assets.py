from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEST_ROOT = ROOT / "student-tests"


def read(path: Path) -> str:
    assert path.is_file(), f"Missing learning document: {path.relative_to(ROOT)}"
    text = path.read_text(encoding="utf-8")
    assert text.startswith("# "), f"{path}: missing title"
    assert "## מטרת התרגיל" in text, f"{path}: missing exercise objective"
    assert "## כיצד לוודא שהתרגיל הושלם" in text, f"{path}: missing validation instructions"
    return text


def require(path: Path, text: str, values: list[str]) -> None:
    missing = [value for value in values if value not in text]
    assert not missing, f"{path}: missing tested requirements: {missing}"


def main() -> None:
    readmes = [TEST_ROOT / f"exercise_{number:02d}" / "README.md" for number in range(1, 10)]
    texts = [read(path) for path in readmes]

    requirements = [
        ["GET /api/health", "200", "application/json", '{"status": "ok"}'],
        [
            "POST /api/game", "2–4", "422", "detail", "Ada", "ada", "1500", "position",
            "is_bankrupt", "owned_tile_ids", "16", "status", "current_player_id", "winner_id",
            "available_actions", "players", "board", "last_event", "event_log",
        ],
        ["GET /api/game", "200", "404", "422", "הודעה מתאימה", "אינה משנה", "אינו מוחק או מחליף"],
        [
            "POST /api/game/roll", "1 ל-6", "מסלול מעגלי", "סיבוב נוסף", "200",
            "received 200 for Start", "409", "אינו משנה", "state", "GameState",
            "event_log", "rolled", "moved to",
        ],
        [
            "POST /api/game/end-turn", "current_player_id", '["roll"]', "409",
            "received 200 for Start", "last_event", "event_log",
        ],
        [
            "POST /api/game/roll", "reward", "penalty", "surprise", "Surprise", "property",
            '["buy", "end_turn"]', "owner_id", "last_event", "event_log",
        ],
        [
            "POST /api/game/buy", "price", "money", "owner_id", "owned_tile_ids",
            '["end_turn"]', "409", "הודעה מתאימה", "אינה משנה",
        ],
        [
            "POST /api/game/roll", "rent", "paid", "rent to", "for <property>.",
            "200", "available_actions", "last_event", "event_log",
        ],
        [
            "is_bankrupt", "finished", "winner_id", "available_actions", "500",
            "POST /api/game/reset", "not_started", '"players": []', '"board": []',
            '"last_event"', '"event_log"', "409", "הודעה מתאימה",
        ],
    ]
    for path, text, expected in zip(readmes, texts, requirements):
        require(path, text, expected)

    combined = "\n".join(texts)
    for endpoint in [
        "/api/health", "/api/game", "/api/game/roll", "/api/game/buy",
        "/api/game/end-turn", "/api/game/reset",
    ]:
        assert endpoint in combined, f"Exercise READMEs do not document {endpoint}"

    forbidden_header = "".join(["X-Test-", "Dice-Roll"])
    assert forbidden_header not in combined, "A testing-only dice header is still documented"

    markdown_entrypoints = [
        ROOT / "README.md",
        ROOT / "student-api" / "README.md",
        ROOT / "instructor" / "README.md",
        TEST_ROOT / "README.md",
        *readmes,
    ]
    for path in markdown_entrypoints:
        assert ".docx" not in path.read_text(encoding="utf-8").lower(), f"{path}: still directs learners to Word files"

    for number in range(1, 10):
        tests = "\n".join(
            path.read_text(encoding="utf-8")
            for path in (TEST_ROOT / f"exercise_{number:02d}").glob("test_*.py")
        )
        assert "assert " not in tests, f"Exercise {number} has an unstructured assertion"
        assert "expect(" in tests or "fail_check(" in tests, f"Exercise {number} has no structured checks"

    print("Validated 9 README exercises against the student checkpoint contracts.")


if __name__ == "__main__":
    main()
