#!/usr/bin/env python3
"""Import Organizações docx into content/chapters, timelines, and document.json."""

from __future__ import annotations

import html
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from import_organizacoes_lib import (
    MEDIA,
    Block,
    Run,
    run_import,
    runs_to_md,
    runs_to_plain,
)

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DOCX = Path(
    "/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/01_Briefing/4. [v1] Organizações (2).docx"
)

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def normalize_external_url(url: str) -> str:
    url = html.unescape(url.strip())
    for sep in ("%5D", "%29", "]("):
        if sep in url:
            url = url.split(sep, 1)[0]
    return url.rstrip("?)").strip()


def run_is_on(el: ET.Element | None) -> bool:
    if el is None:
        return False
    val = el.get(f"{{{NS['w']}}}val")
    return val is None or val not in {"0", "false"}


def run_from_r(r: ET.Element) -> list[Run]:
    parts: list[str] = []
    for child in r:
        tag = child.tag.split("}")[-1]
        if tag == "t":
            parts.append(child.text or "")
        elif tag == "br":
            parts.append("\n")
        elif tag == "tab":
            parts.append("\t")
    text = "".join(parts)
    if not text:
        return []
    bold = run_is_on(r.find(".//w:b", NS))
    italic = run_is_on(r.find(".//w:i", NS))
    return [Run(text=text, bold=bold, italic=italic)]


def para_runs(p: ET.Element, rid_to_target: dict[str, str]) -> list[Run]:
    runs: list[Run] = []
    for child in p:
        tag = child.tag.split("}")[-1]
        if tag == "r":
            runs.extend(run_from_r(child))
            continue
        if tag != "hyperlink":
            continue
        rid = child.get(f"{{{NS['r']}}}id")
        target = normalize_external_url(rid_to_target.get(rid or "", ""))
        inner: list[Run] = []
        for r in child.findall("w:r", NS):
            inner.extend(run_from_r(r))
        if target and (
            target.startswith("http://")
            or target.startswith("https://")
            or target.startswith("mailto:")
        ):
            for ir in inner:
                if ir.text:
                    runs.append(
                        Run(text=ir.text, bold=ir.bold, italic=ir.italic, href=target)
                    )
        else:
            runs.extend(inner)
    return runs


def cell_plain(tc: ET.Element, rid_to_target: dict[str, str]) -> str:
    parts: list[str] = []
    for p in tc.findall(".//w:p", NS):
        pr = para_runs(p, rid_to_target)
        md = runs_to_md(pr).strip()
        if md:
            parts.append(md)
    return "\n".join(parts).strip()


def parse_docx(path: Path) -> tuple[list[Block], dict[str, bytes]]:
    with zipfile.ZipFile(path) as z:
        doc = z.read("word/document.xml")
        rels = z.read("word/_rels/document.xml.rels").decode("utf-8")
        rid_to_target = dict(re.findall(r'Id="([^"]+)"[^>]*Target="([^"]+)"', rels))
        image_bytes: dict[str, bytes] = {}
        for name in z.namelist():
            if name.startswith("word/media/"):
                image_bytes[name.split("/")[-1]] = z.read(name)

    root = ET.fromstring(doc)
    body = root.find("w:body", NS)
    if body is None:
        raise SystemExit("document body missing")

    blocks: list[Block] = []
    for child in list(body):
        tag = child.tag.split("}")[-1]
        if tag == "p":
            imgs = []
            for blip in child.findall(".//a:blip", NS):
                rid = blip.get(f"{{{NS['r']}}}embed")
                if rid and rid in rid_to_target:
                    target = rid_to_target[rid]
                    if "media/" in target:
                        imgs.append(target.split("/")[-1])
            for im in imgs:
                blocks.append(Block(kind="image", image_target=im))
            runs = para_runs(child, rid_to_target)
            plain = runs_to_plain(runs).strip()
            if not plain:
                continue
            pstyle = child.find("w:pPr/w:pStyle", NS)
            style = None
            if pstyle is not None:
                style = pstyle.get(f"{{{NS['w']}}}val")
            list_item = child.find("w:pPr/w:numPr", NS) is not None
            blocks.append(
                Block(
                    kind="paragraph",
                    runs=runs,
                    plain=plain,
                    style=style,
                    list_item=list_item,
                )
            )
        elif tag == "tbl":
            rows: list[list[str]] = []
            for tr in child.findall(".//w:tr", NS):
                row: list[str] = []
                for tc in tr.findall("w:tc", NS):
                    row.append(cell_plain(tc, rid_to_target))
                if any(cell.strip() for cell in row):
                    rows.append(row)
            if rows:
                blocks.append(Block(kind="table", rows=rows))

    return blocks, image_bytes


def main() -> None:
    docx = Path(__import__("os").environ.get("ORGANIZACOES_DOCX", str(DEFAULT_DOCX)))
    if not docx.is_file():
        raise SystemExit(f"Missing docx: {docx}")

    blocks, image_bytes = parse_docx(docx)

    MEDIA.mkdir(parents=True, exist_ok=True)
    image_map: dict[str, str] = {}
    for name, data in image_bytes.items():
        target = f"org-{name}"
        (MEDIA / target).write_bytes(data)
        image_map[name] = target

    run_import(blocks, image_map, source_label=docx.name)


if __name__ == "__main__":
    main()
