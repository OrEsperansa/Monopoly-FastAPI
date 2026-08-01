from __future__ import annotations

import re
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "property-empire-student-checkpoints-he.html"
TARGET = ROOT / "docs" / "property-empire-student-checkpoints-he.docx"


class BlockParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[tuple[str, str]] = []
        self._stack: list[str] = []
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"h1", "h2", "h3", "p", "li", "pre", "th", "td"}:
            self._stack.append(tag)
            self._buffer = []
        elif tag == "br" and self._stack:
            self._buffer.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if self._stack and self._stack[-1] == tag:
            text = normalize_text("".join(self._buffer), preserve_newlines=tag == "pre")
            if text:
                self.blocks.append((tag, text))
            self._stack.pop()
            self._buffer = []
        elif tag == "tr":
            self.blocks.append(("spacer", ""))

    def handle_data(self, data: str) -> None:
        if self._stack:
            self._buffer.append(data)


def normalize_text(value: str, preserve_newlines: bool = False) -> str:
    value = value.replace("\xa0", " ")
    if preserve_newlines:
        lines = [re.sub(r"[ \t]+", " ", line).rstrip() for line in value.strip().splitlines()]
        return "\n".join(lines)
    return re.sub(r"\s+", " ", value).strip()


def text_run(text: str, *, bold: bool = False, size: int = 24, font: str = "Arial") -> str:
    props = [
        f'<w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:cs="{font}"/>',
        f'<w:sz w:val="{size}"/>',
        f'<w:szCs w:val="{size}"/>',
        "<w:rtl/>",
    ]
    if bold:
        props.extend(["<w:b/>", "<w:bCs/>"])
    escaped = escape(text)
    return f'<w:r><w:rPr>{"".join(props)}</w:rPr><w:t xml:space="preserve">{escaped}</w:t></w:r>'


def paragraph(block_type: str, text: str) -> str:
    if block_type == "spacer":
        return "<w:p/>"

    style = ""
    size = 24
    bold = False
    spacing_after = 120
    indent = ""
    border = ""

    if block_type == "h1":
        size = 40
        bold = True
        spacing_after = 220
    elif block_type == "h2":
        size = 32
        bold = True
        spacing_after = 180
        border = '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/></w:pBdr>'
    elif block_type == "h3":
        size = 26
        bold = True
        spacing_after = 120
    elif block_type == "li":
        text = "• " + text
        indent = '<w:ind w:right="360" w:hanging="240"/>'
    elif block_type == "pre":
        size = 20
        style = '<w:shd w:fill="F3F4F6"/><w:spacing w:after="160"/>'
    elif block_type in {"th", "td"}:
        text = text + " |"
        bold = block_type == "th"
        spacing_after = 40

    spacing = f'<w:spacing w:after="{spacing_after}" w:line="276" w:lineRule="auto"/>'
    ppr = f'<w:pPr><w:bidi/><w:jc w:val="right"/>{spacing}{indent}{border}{style}</w:pPr>'
    runs = []
    for index, line in enumerate(text.splitlines()):
        if index:
            runs.append("<w:r><w:br/></w:r>")
        runs.append(text_run(line, bold=bold, size=size, font="Consolas" if block_type == "pre" else "Arial"))
    return f"<w:p>{ppr}{''.join(runs)}</w:p>"


def make_document_xml(blocks: list[tuple[str, str]]) -> str:
    body = "\n".join(paragraph(block_type, text) for block_type, text in blocks)
    sect = (
        '<w:sectPr>'
        '<w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>'
        '<w:bidi/>'
        '</w:sectPr>'
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f"<w:body>{body}{sect}</w:body></w:document>"
    )


def write_docx(document_xml: str) -> None:
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
        '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>'
        '</Types>'
    )
    rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        '</Relationships>'
    )
    doc_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>'
    )
    styles = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:docDefaults><w:rPrDefault><w:rPr>'
        '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>'
        '<w:sz w:val="24"/><w:szCs w:val="24"/><w:rtl/>'
        '</w:rPr></w:rPrDefault></w:docDefaults>'
        '</w:styles>'
    )
    settings = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:defaultTabStop w:val="720"/><w:displayBackgroundShape/><w:mirrorMargins/>'
        '</w:settings>'
    )

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(TARGET, "w", zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types)
        docx.writestr("_rels/.rels", rels)
        docx.writestr("word/_rels/document.xml.rels", doc_rels)
        docx.writestr("word/document.xml", document_xml)
        docx.writestr("word/styles.xml", styles)
        docx.writestr("word/settings.xml", settings)


def main() -> None:
    parser = BlockParser()
    parser.feed(SOURCE.read_text(encoding="utf-8"))
    write_docx(make_document_xml(parser.blocks))
    print(TARGET)


if __name__ == "__main__":
    main()
