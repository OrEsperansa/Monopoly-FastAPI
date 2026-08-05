from pathlib import Path
from zipfile import ZipFile
import os
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = Path(os.environ.get("PROPERTY_EMPIRE_DOCX_ROOT", ROOT))
STUDENT_DIR = ASSET_ROOT / "docs" / "student-backend-exercises-he"
INSTRUCTOR_DOC = ASSET_ROOT / "instructor" / "property-empire-instructor-guide-he.docx"
WORD_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def read_docx(path: Path) -> tuple[str, str]:
    with ZipFile(path) as archive:
        bad_member = archive.testzip()
        if bad_member:
            raise AssertionError(f"{path}: corrupt member {bad_member}")
        xml = archive.read("word/document.xml").decode("utf-8")
    root = ET.fromstring(xml)
    text = " ".join(node.text or "" for node in root.iter(WORD_NS + "t"))
    return xml, text


def main() -> None:
    student_docs = sorted(path for path in STUDENT_DIR.glob("*.docx") if not path.name.startswith("~$"))
    assert len(student_docs) == 8, f"Expected 8 student documents, found {len(student_docs)}"
    expected_names = [f"{number:02d}_" for number in range(1, 9)]
    assert all(path.name.startswith(prefix) for path, prefix in zip(student_docs, expected_names))

    combined = []
    forbidden = ["game_engine/", "app/main.py", "class Game", "def create_game"]
    required_sections = [
        "המשימה בשפה פשוטה", "מה המשתמש מצפה שיקרה", "מונחים מקצועיים במסמך", "גבולות המשימה",
        "זמן משוער", "ידע מוקדם", "מה נבדק בתרגיל", "מקרי שגיאה", "מה מגישים", "רשימת בדיקה",
    ]
    for path in student_docs:
        xml, text = read_docx(path)
        assert "<w:bidi" in xml and "<w:rtl" in xml, f"{path}: missing RTL metadata"
        with ZipFile(path) as archive:
            styles = archive.read("word/styles.xml").decode("utf-8")
            numbering = archive.read("word/numbering.xml").decode("utf-8")
        assert 'w:top="1440"' in xml and 'w:right="1440"' in xml
        assert 'w:bottom="1440"' in xml and 'w:left="1440"' in xml
        assert 'w:header="708"' in xml and 'w:footer="708"' in xml
        assert 'w:before="360"' in styles and 'w:after="200"' in styles
        assert 'w:right="540"' in numbering and 'w:hanging="270"' in numbering
        assert all(section in text for section in required_sections), f"{path}: missing a learning section"
        assert not any(term in text for term in forbidden), f"{path}: contains implementation guidance"
        combined.append(text)

    all_text = " ".join(combined)
    endpoints = [
        "/api/health", "/api/game", "/api/game/roll", "/api/game/buy",
        "/api/game/end-turn", "/api/game/reset",
    ]
    assert all(endpoint in all_text for endpoint in endpoints), "Student documents do not cover every endpoint"
    forbidden_header = "".join(["X-Test-", "Dice-Roll"])
    assert forbidden_header not in all_text, "Testing-only dice header must not be documented"

    game_state_fields = [
        "status", "current_player_id", "winner_id", "available_actions",
        "players", "board", "last_event", "event_log",
    ]
    for path, text in zip(student_docs[1:], combined[1:]):
        assert all(field in text for field in game_state_fields), f"{path}: response example is not a complete GameState"

    xml, instructor_text = read_docx(INSTRUCTOR_DOC)
    assert "<w:bidi" in xml and "<w:rtl" in xml
    for required in ["שלוש רמות רמז", "מחוון הערכה", "50%", "20%", "15%", "10%", "5%"]:
        assert required in instructor_text, f"Instructor guide is missing {required}"

    print("Validated 8 student DOCX files and 1 instructor DOCX file.")


if __name__ == "__main__":
    main()
