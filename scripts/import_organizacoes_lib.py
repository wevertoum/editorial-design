"""Shared Organizações import: blocks → MDX, timelines, document.json."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).resolve().parent.parent
CHAPTERS = ROOT / "content" / "chapters"
TIMELINES = ROOT / "content" / "timelines"
INFOGRAPHICS = ROOT / "content" / "infographics"
MEDIA = ROOT / "assets" / "media"
MANIFEST = ROOT / "content" / "document.json"

COUNTRY_HEADINGS = {
    "AUSTRÁLIA.": ("australia", "Austrália"),
    "ESTADOS UNIDOS.": ("usa", "Estados Unidos"),
    "INGLATERRA.": ("england", "Inglaterra"),
    "NIGÉRIA.": ("nigeria", "Nigéria"),
    "CHILE.": ("chile", "Chile"),
}

FRONT_SECTION_LABELS = frozenset({"APRESENTAÇÃO", "RESUMO EXECUTIVO", "ORGANIZAÇÕES"})

NODES_PER_SPREAD = 4

DEFAULT_MAPEAMENTO_CONTENT = Path(
    "/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/03_Publicacao/content"
)
DEFAULT_MAPEAMENTO_MEDIA = Path(
    "/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/03_Publicacao/links/docx-media"
)
MAPEAMENTO_SNAPSHOT = ROOT / "content" / "mapeamento"


@dataclass
class Run:
    text: str
    bold: bool = False
    italic: bool = False


@dataclass
class Block:
    kind: Literal["paragraph", "table", "image"]
    runs: list[Run] = field(default_factory=list)
    plain: str = ""
    style: str | None = None
    rows: list[list[str]] = field(default_factory=list)
    image_target: str | None = None


def runs_to_plain(runs: list[Run]) -> str:
    return "".join(r.text for r in runs)


def runs_to_md(runs: list[Run], *, force_body_weight: bool = False) -> str:
    meaningful = [r for r in runs if r.text.strip()]
    strip_bold = force_body_weight or (
        meaningful and all(r.bold for r in meaningful) and not any(r.italic for r in meaningful)
    )
    out: list[str] = []
    for run in runs:
        text = run.text.replace("{", "\\{")
        if not text:
            continue
        if strip_bold:
            if run.italic:
                text = f"*{text}*"
            out.append(text)
            continue
        if run.bold and run.italic:
            text = f"***{text}***"
        elif run.bold:
            text = f"**{text}**"
        elif run.italic:
            text = f"*{text}*"
        out.append(text)
    return "".join(out)


def slugify(text: str) -> str:
    text = text.lower()
    text = (
        text.replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ã", "a")
        .replace("õ", "o")
        .replace("ç", "c")
    )
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")[:48]
    if not text or not text[0].isalpha():
        text = f"y-{text}" if text else "year"
    return text


def node_id(year: str, index: int) -> str:
    base = slugify(year)
    return base if index == 0 else f"{base}-{index}"


def is_cross_table(rows: list[list[str]]) -> bool:
    if not rows:
        return False
    header = " | ".join(rows[0]).lower()
    return "currículo" in header and "organização" in header


def is_org_trajectory_table(rows: list[list[str]]) -> bool:
    if not rows:
        return False
    header = " | ".join(rows[0]).lower()
    return header.startswith("ano") and "marco" in header


def is_actors_table(rows: list[list[str]]) -> bool:
    if not rows:
        return False
    header = " | ".join(rows[0]).lower()
    return "ator" in header and "papel" in header


def cross_table_to_nodes(rows: list[list[str]]) -> list[dict[str, str]]:
    data = rows[1:]
    nodes: list[dict[str, str]] = []
    current: dict[str, str] | None = None
    for row in data:
        cells = row + [""] * (3 - len(row))
        year, cur, org = (cells[0] or "").strip(), (cells[1] or "").strip(), (cells[2] or "").strip()
        if year:
            if current:
                nodes.append(current)
            current = {"year": year, "curriculo": cur, "organizacao": org}
        elif current:
            if cur:
                current["curriculo"] = (current["curriculo"] + " " + cur).strip()
            if org:
                current["organizacao"] = (current["organizacao"] + " " + org).strip()
    if current:
        nodes.append(current)
    return nodes


def jsx_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False)


def table_to_mdx(rows: list[list[str]], caption: str = "") -> str:
    if not rows:
        return ""
    if len(rows) == 1 and len(rows[0]) == 1:
        return f"{runs_to_md([Run(text=rows[0][0])])}\n\n"
    if all(len(r) == 1 for r in rows):
        return "".join(f"{runs_to_md([Run(text=r[0])])}\n\n" for r in rows if r[0].strip())

    col_count = max(len(r) for r in rows)

    def pad(row: list[str]) -> list[str]:
        cells = list(row)
        while len(cells) < col_count:
            cells.append("")
        return cells[:col_count]

    if is_actors_table(rows):
        headers = pad(rows[0])
        body = [pad(r) for r in rows[1:]]
        cap = caption or rows[0][0] if rows else "Tabela"
        return (
            f'<EditorialTable variant="vozes" caption={{{jsx_json(cap)}}} '
            f"columns={{{jsx_json(headers)}}} rows={{{jsx_json(body)}}} />\n\n"
        )

    if is_org_trajectory_table(rows):
        headers = pad(rows[0])
        body = [pad(r) for r in rows[1:]]
        cap = caption or "Marcos da organização"
        return (
            f'<EditorialTable variant="vozes" caption={{{jsx_json(cap)}}} '
            f"columns={{{jsx_json(headers)}}} rows={{{jsx_json(body)}}} />\n\n"
        )

    if rows[0] and rows[0][0].lower().startswith("ano"):
        headers = pad(rows[0])
        body = [pad(r) for r in rows[1:]]
        return (
            f'<EditorialTable variant="vozes" caption={{{jsx_json(caption)}}} '
            f"columns={{{jsx_json(headers)}}} rows={{{jsx_json(body)}}} />\n\n"
        )

    headers = pad(rows[0])
    body = [pad(r) for r in rows[1:]] if len(rows) > 1 else []
    return (
        f'<EditorialTable variant="vozes" caption={{{jsx_json(caption)}}} '
        f"columns={{{jsx_json(headers)}}} rows={{{jsx_json(body)}}} />\n\n"
    )


def is_country_heading(text: str) -> bool:
    return text.strip() in COUNTRY_HEADINGS


def heading_level(text: str, style: str | None) -> int | None:
    plain = text.strip()

    if plain in FRONT_SECTION_LABELS:
        return 2

    if is_country_heading(plain):
        return 2

    if style == "Heading1":
        if re.match(r"^\d+\.\s", plain) and not re.match(r"^\d+\.\d+\.", plain):
            if len(plain) <= 200:
                return 3
        if plain.isupper() and len(plain) <= 96:
            return 2
        if len(plain) >= 80:
            return None
        return None

    if re.match(r"^\d+\.\s", plain) and not re.match(r"^\d+\.\d+\.", plain):
        return 2
    if re.match(r"^\d+\.\d+\.", plain):
        return 3
    return None


def mdx_escape_heading(text: str) -> str:
    return text.replace("#", "\\#")


def paragraph_to_mdx(block: Block) -> str:
    level = heading_level(block.plain, block.style)
    if level:
        md = runs_to_md(block.runs, force_body_weight=True)
    else:
        md = runs_to_md(
            block.runs,
            force_body_weight=block.style == "Heading1",
        )
    if level == 2:
        return f"## {mdx_escape_heading(md)}\n\n"
    if level == 3:
        return f"### {mdx_escape_heading(md)}\n\n"
    if block.plain.lower().startswith("fonte:"):
        body = md[7:].strip() if md.lower().startswith("fonte:") else md
        if body.startswith(":"):
            body = body[1:].strip()
        return f"<SourceNote>{body}</SourceNote>\n\n"
    return f"{md}\n\n"


@dataclass
class Segment:
    kind: Literal["flow", "cross"]
    slug: str
    kicker: str
    blocks: list[Block] = field(default_factory=list)
    cross_rows: list[list[str]] = field(default_factory=list)
    org_panel: bool = False


def segment_flow_to_mdx(seg: Segment, image_map: dict[str, str], *, has_rail: bool = False) -> str:
    kicker = seg.kicker.replace('"', '\\"')
    layout_classes: list[str] = []
    if has_rail:
        layout_classes.append("vozes-with-rail")
    else:
        layout_classes.append("vozes-prose-only")
    if seg.slug in {"apresentacao", "resumo-executivo"}:
        layout_classes.append("vozes-front-matter")
    if seg.org_panel:
        layout_classes.append("org-panel-page")
    layout_attrs = f' className="{" ".join(layout_classes)}"' if layout_classes else ""
    parts = [
        "---\n",
        f'kicker: "{kicker}"\n',
        "sheetVariant: vozes-report\n",
        "---\n\n",
        f"<VozesLayout{layout_attrs}>\n<VozesMain>\n\n",
    ]
    for block in seg.blocks:
        if block.kind == "paragraph":
            parts.append(paragraph_to_mdx(block))
        elif block.kind == "image" and block.image_target:
            media = image_map.get(block.image_target, block.image_target)
            alt = f"Ilustração do documento ({media})."
            parts.append(
                f'<Figure src="media/{media}" alt={{{jsx_json(alt)}}} />\n\n'
            )
        elif block.kind == "table":
            cap = ""
            parts.append(table_to_mdx(block.rows, cap))
    parts.append("</VozesMain>\n<VozesRail>\n\n</VozesRail>\n</VozesLayout>\n")
    return "".join(parts)


def write_dual_track_timelines(
    seg: Segment, country_slug: str, spread_index: int, sections: list[dict]
) -> None:
    nodes = cross_table_to_nodes(seg.cross_rows)
    chunks = [nodes[i : i + NODES_PER_SPREAD] for i in range(0, len(nodes), NODES_PER_SPREAD)]
    for part_index, chunk in enumerate(chunks):
        part = "a" if part_index % 2 == 0 else "b"
        spread = spread_index + part_index // 2
        file_slug = f"{country_slug}-cruzamento-{spread}-{part}"
        out_nodes = []
        for i, node in enumerate(chunk):
            out_nodes.append(
                {
                    "id": node_id(node["year"], i),
                    "year": node["year"],
                    "curriculo": node["curriculo"],
                    "organizacao": node["organizacao"],
                }
            )
        payload = {
            "variant": "dual-track",
            "kicker": f"{seg.kicker} · Cruzamento",
            "title": "Onde as trajetórias se cruzam",
            "lede": [],
            "spreadPart": part,
            "spreadIndex": spread,
            "nodes": out_nodes,
        }
        path = TIMELINES / f"{file_slug}.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        sections.append(
            {
                "id": file_slug,
                "strategy": "structured",
                "layout": "timeline",
                "source": f"timelines/{file_slug}.json",
            }
        )


def run_import(blocks: list[Block], image_map: dict[str, str], *, source_label: str) -> int:
    """Write chapters, timelines, and document.json from parsed blocks. Returns section count."""
    segments: list[Segment] = []
    current: Segment | None = None
    current_country: str | None = None
    current_country_label: str | None = None
    country_flow_parts: dict[str, int] = {}
    mode: Literal["front", "body"] = "front"
    org_panel_next = False

    def start_segment(kind: Literal["flow", "cross"], slug: str, kicker: str) -> Segment:
        return Segment(kind=kind, slug=slug, kicker=kicker, org_panel=org_panel_next)

    for block in blocks:
        if block.kind == "paragraph":
            plain = block.plain.strip()
            if plain == "ORGANIZAÇÕES":
                mode = "body"
                continue
            if plain in COUNTRY_HEADINGS:
                key, label = COUNTRY_HEADINGS[plain]
                current_country = key
                current_country_label = label
                country_flow_parts[key] = 1
                current = start_segment("flow", key, label)
                segments.append(current)
                org_panel_next = False
                continue
            if mode == "front":
                if plain in {"Levantamento Internacional", "de Instituições de Apoio a Padrões Curriculares", "2026"}:
                    continue
                if plain in {"APRESENTAÇÃO", "RESUMO EXECUTIVO"}:
                    slug = "apresentacao" if plain == "APRESENTAÇÃO" else "resumo-executivo"
                    kicker = "Apresentação" if plain == "APRESENTAÇÃO" else "Resumo executivo"
                    current = start_segment("flow", slug, kicker)
                    segments.append(current)
                    current.blocks.append(block)
                    continue
                if current and current.kind == "flow" and current.slug in {"apresentacao", "resumo-executivo"}:
                    current.blocks.append(block)
                    continue
            if current is None:
                continue
            if re.match(r"^[234]\.\s", plain) and "Onde as trajetórias se cruzam" in plain:
                current.blocks.append(block)
                continue
            if re.match(r"^2\.\s", plain) and current.kind == "flow":
                org_panel_next = True
                if current.blocks:
                    current.org_panel = False
                current.blocks.append(block)
                current.org_panel = True
                continue
            if re.match(r"^4\.\s", plain) and "BRITISH CURRICULUM FORUM" in plain.upper():
                org_panel_next = True
                current.org_panel = True
                current.blocks.append(block)
                continue
            current.blocks.append(block)
        elif block.kind == "table":
            if is_cross_table(block.rows):
                if current and current.kind == "flow":
                    current.org_panel = False
                cross_slug = current_country or (current.slug if current else "unknown")
                cross_kicker = current_country_label or (current.kicker if current else "Cruzamento")
                cross_seg = start_segment("cross", cross_slug, cross_kicker)
                cross_seg.cross_rows = block.rows
                segments.append(cross_seg)
                org_panel_next = False
                if current_country and current_country_label:
                    n = country_flow_parts.get(current_country, 1) + 1
                    country_flow_parts[current_country] = n
                    slug = f"{current_country}-{n}" if n > 1 else current_country
                    current = start_segment("flow", slug, current_country_label)
                    segments.append(current)
                else:
                    current = None
            elif current is not None:
                current.blocks.append(block)
        elif block.kind == "image":
            if current is not None:
                current.blocks.append(block)

    sections: list[dict] = []
    country_spread_counter: dict[str, int] = {}

    for folder, pattern in ((CHAPTERS, "*.mdx"), (TIMELINES, "*.json"), (INFOGRAPHICS, "*.json")):
        folder.mkdir(parents=True, exist_ok=True)
        for f in folder.glob(pattern):
            f.unlink()

    for seg in segments:
        if seg.kind == "flow":
            fname = f"{seg.slug}.mdx"
            (CHAPTERS / fname).write_text(segment_flow_to_mdx(seg, image_map), encoding="utf-8")
            sections.append(
                {
                    "id": seg.slug,
                    "strategy": "flow",
                    "layout": "standard",
                    "source": f"chapters/{fname}",
                }
            )
        elif seg.kind == "cross":
            base = seg.slug
            idx = country_spread_counter.get(base, 1)
            write_dual_track_timelines(seg, base, idx, sections)
            spreads = max(1, (len(cross_table_to_nodes(seg.cross_rows)) + NODES_PER_SPREAD - 1) // NODES_PER_SPREAD)
            country_spread_counter[base] = idx + spreads

    manifest = {
        "id": "levantamento-organizacoes-2026",
        "language": "pt-BR",
        "title": "Levantamento Internacional de Instituições de Apoio a Padrões Curriculares",
        "subtitle": "2026",
        "author": "Vozes da Educação",
        "sections": sections,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    used_images: set[str] = set()
    for mdx_path in CHAPTERS.glob("*.mdx"):
        for match in re.findall(r'media/(org-[^"\\]+)', mdx_path.read_text(encoding="utf-8")):
            used_images.add(match)
    for media_file in MEDIA.glob("org-*.png"):
        if media_file.name not in used_images:
            media_file.unlink()

    print(f"Imported {len(sections)} sections from {source_label}")
    print(f"Images referenced: {len(used_images)}")
    return len(sections)
