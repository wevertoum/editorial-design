"""Shared Organizações import: blocks → MDX, timelines, document.json."""

from __future__ import annotations

import json
import re
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
CHAPTERS = ROOT / "content" / "chapters"
TIMELINES = ROOT / "content" / "timelines"
INFOGRAPHICS = ROOT / "content" / "infographics"
MEDIA = ROOT / "assets" / "media"
MANIFEST = ROOT / "content" / "document.json"

COUNTRY_HEADINGS = {
    "AUSTRÁLIA.": ("australia", "Austrália", "AU"),
    "ESTADOS UNIDOS.": ("usa", "Estados Unidos", "US"),
    "INGLATERRA.": ("england", "Inglaterra", "GB"),
    "NIGÉRIA.": ("nigeria", "Nigéria", "NG"),
    "CHILE.": ("chile", "Chile", "CL"),
}

COUNTRY_OPENING_BY_SLUG = {
    slug: (code, label) for slug, label, code in COUNTRY_HEADINGS.values()
}

FRONT_SECTION_LABELS = frozenset({"APRESENTAÇÃO", "RESUMO EXECUTIVO", "ORGANIZAÇÕES"})

SUBSECTION_LABELS = frozenset({"Canais de participação"})

SHOUTING_TITLES = {
    "A ACHIEVE": "Achieve",
    "A CURRICULUM ORGANIZATION OF NIGERIA": "Curriculum Organization of Nigeria",
    "O BRITISH CURRICULUM FORUM (BCF)": "British Curriculum Forum (BCF)",
}

KNOWN_PROFILES = {
    "Anna Ritzema": ("Executive Director, ACSA", "Perfil"),
    "Michael Cohen": ("President, Achieve", "Perfil"),
    "Victoria Pendry": ("CEO, Curriculum Foundation", "Perfil"),
    "Grace Healy": ("President, British Curriculum Forum", "Perfil"),
    "Aisha Isa": ("Presidenta Nacional, CON", "Perfil"),
    "Alfredo Grez Kaulen": ("Presidente do diretório, Fundación Reimagina", "Perfil"),
}

NODES_PER_SPREAD = 4

ROLE_DESCRIPTION_RE = re.compile(
    r"^(Autoridade|Analisa|Apoiam|Conduz|Define|Definem|Desenvolve|Estabelece|"
    r"Formula|Inspeciona|Organizam|Planejam|Realizam|Reúne|Traduzem|Transformam)\b"
)


def is_role_description(text: str) -> bool:
    t = text.strip()
    return bool(t) and ROLE_DESCRIPTION_RE.match(t) is not None


def join_label_subtitle(label: str, subtitle: str) -> str:
    return f"{label.strip()}\n{subtitle.strip()}"

DEFAULT_MAPEAMENTO_CONTENT = Path(
    "/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/03_Publicacao/content"
)
DEFAULT_MAPEAMENTO_MEDIA = Path(
    "/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/03_Publicacao/links/docx-media"
)
MAPEAMENTO_SNAPSHOT = ROOT / "content" / "mapeamento"

DEFAULT_ORGANIZACOES_DOCX = Path(
    "/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/01_Briefing/4. [v1] Organizações (2).docx"
)

DOCX_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def list_pairs_from_docx(path: Path) -> set[tuple[str, str]]:
    """Title/body paragraph pairs that use Word list markers (w:numPr + following paragraph)."""
    if not path.is_file():
        return set()
    with zipfile.ZipFile(path) as z:
        doc = z.read("word/document.xml")
    root = ET.fromstring(doc)
    body = root.find("w:body", DOCX_NS)
    if body is None:
        return set()
    paras: list[tuple[str, bool]] = []
    for child in list(body):
        if child.tag.split("}")[-1] != "p":
            continue
        plain = "".join(t.text or "" for t in child.findall(".//w:t", DOCX_NS)).strip()
        if not plain:
            continue
        is_list = child.find("w:pPr/w:numPr", DOCX_NS) is not None
        paras.append((plain, is_list))
    pairs: set[tuple[str, str]] = set()
    for i, (title, is_list) in enumerate(paras):
        if not is_list:
            continue
        if i + 1 >= len(paras):
            pairs.add((title, ""))
            continue
        body_text, _ = paras[i + 1]
        pairs.add((title, body_text))
    return pairs


def coalesce_list_pairs_scoped(
    blocks: list[Block], pairs: set[tuple[str, str]]
) -> list[Block]:
    """Merge list title/body only for pairs confirmed in the source DOCX."""
    if not pairs:
        return blocks
    out: list[Block] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        if block.kind != "paragraph":
            out.append(block)
            i += 1
            continue
        if i + 1 < len(blocks) and blocks[i + 1].kind == "paragraph":
            nxt = blocks[i + 1]
            key = (block.plain.strip(), nxt.plain.strip())
            if key in pairs and heading_level(nxt.plain, nxt.style) is None:
                out.append(
                    Block(
                        kind="list",
                        runs=block.runs,
                        plain=block.plain,
                        style=block.style,
                        body_runs=nxt.runs,
                        body_plain=nxt.plain,
                    )
                )
                i += 2
                continue
        key_single = (block.plain.strip(), "")
        if key_single in pairs:
            out.append(
                Block(kind="list", runs=block.runs, plain=block.plain, style=block.style)
            )
            i += 1
            continue
        out.append(block)
        i += 1
    return out


@dataclass
class Run:
    text: str
    bold: bool = False
    italic: bool = False
    href: str | None = None


@dataclass
class Block:
    kind: Literal["paragraph", "table", "image", "list", "profile"]
    runs: list[Run] = field(default_factory=list)
    plain: str = ""
    style: str | None = None
    rows: list[list[str]] = field(default_factory=list)
    image_target: str | None = None
    list_item: bool = False
    body_runs: list[Run] = field(default_factory=list)
    body_plain: str = ""
    profile_role: str = ""
    profile_label: str = "Perfil"


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
        elif run.bold and run.italic:
            text = f"***{text}***"
        elif run.bold:
            text = f"**{text}**"
        elif run.italic:
            text = f"*{text}*"
        if run.href:
            url = run.href.replace(")", "%29").replace(" ", "%20")
            text = f"[{text}]({url})"
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
    """Parse Ano | Currículo | Organização tables.

    Continuation rows (empty year) with text only in Currículo are the period
    synthesis (*resumo*). Mixed continuation cells still append to the tracks.
    """
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
            if cur and not org:
                current["resumo"] = ((current.get("resumo") or "") + " " + cur).strip()
            else:
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


def is_cross_heading(text: str) -> bool:
    return "Onde as trajetórias se cruzam" in text


def collapse_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def display_heading_text(text: str, style: str | None) -> str:
    plain = collapse_spaces(text)
    keep_numbered_finding = (
        style == "Heading1"
        and re.match(r"^\d+\.\s", plain)
        and not re.match(r"^\d+\.\d+\.", plain)
    )
    if not keep_numbered_finding:
        plain = re.sub(r"^\d+\.\d+\.\s*", "", plain)
        plain = re.sub(r"^\d+\.\s*", "", plain).strip()
    if plain.lower() == "trajetória da organização":
        plain = "A trajetória da organização"
    return SHOUTING_TITLES.get(plain, plain)


def heading_level(text: str, style: str | None) -> int | None:
    plain = collapse_spaces(text)

    if plain in FRONT_SECTION_LABELS:
        return 2

    if is_country_heading(plain):
        return 2

    if plain in SUBSECTION_LABELS:
        return 3

    if is_cross_heading(plain):
        return None

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


def coalesce_list_pairs(blocks: list[Block]) -> list[Block]:
    """Merge Word list markers (w:numPr) with the following description paragraph (direct DOCX parse)."""
    out: list[Block] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        if block.kind != "paragraph" or not block.list_item:
            out.append(block)
            i += 1
            continue

        if i + 1 < len(blocks) and blocks[i + 1].kind == "paragraph":
            nxt = blocks[i + 1]
            if not nxt.list_item and heading_level(nxt.plain, nxt.style) is None:
                out.append(
                    Block(
                        kind="list",
                        runs=block.runs,
                        plain=block.plain,
                        style=block.style,
                        body_runs=nxt.runs,
                        body_plain=nxt.plain,
                    )
                )
                i += 2
                continue

        out.append(
            Block(kind="list", runs=block.runs, plain=block.plain, style=block.style)
        )
        i += 1
    return out


def coalesce_profiles(blocks: list[Block]) -> list[Block]:
    out: list[Block] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        nxt = blocks[i + 1] if i + 1 < len(blocks) else None
        after = blocks[i + 2] if i + 2 < len(blocks) else None

        if block.kind == "image" and nxt and nxt.kind == "paragraph" and nxt.plain in KNOWN_PROFILES:
            role, label = KNOWN_PROFILES[nxt.plain]
            bio = ""
            if after and after.kind == "paragraph" and heading_level(after.plain, after.style) is None:
                bio = after.plain
            out.append(
                Block(
                    kind="profile",
                    runs=nxt.runs,
                    plain=nxt.plain,
                    style=nxt.style,
                    image_target=block.image_target,
                    profile_role=role,
                    profile_label=label,
                    body_plain=bio,
                )
            )
            i += 3 if bio else 2
            continue

        if block.kind == "paragraph" and block.plain in KNOWN_PROFILES:
            role, label = KNOWN_PROFILES[block.plain]
            if nxt and nxt.kind == "image":
                bio = ""
                if after and after.kind == "paragraph" and heading_level(after.plain, after.style) is None:
                    bio = after.plain
                out.append(
                    Block(
                        kind="profile",
                        runs=block.runs,
                        plain=block.plain,
                        style=block.style,
                        image_target=nxt.image_target,
                        profile_role=role,
                        profile_label=label,
                        body_plain=bio,
                    )
                )
                i += 3 if bio else 2
                continue

        out.append(block)
        i += 1
    return out


def profile_to_mdx(block: Block, image_map: dict[str, str]) -> str:
    media = image_map.get(block.image_target or "", block.image_target or "")
    return (
        f"<ProfileCard\n"
        f"  name={{{jsx_json(block.plain)}}}\n"
        f"  role={{{jsx_json(block.profile_role)}}}\n"
        f"  bio={{{jsx_json(block.body_plain)}}}\n"
        f'  photo="media/{media}"\n'
        f"/>\n"
    )


def list_to_mdx(block: Block) -> str:
    title = runs_to_md(block.runs).strip()
    if title and not (title.startswith("**") and title.endswith("**")):
        title = f"**{title}**"
    body = runs_to_md(block.body_runs).strip() if block.body_runs else ""
    inner = f"{title}\n\n{body}".strip() if body else title
    return f"<DetailList>\n\n{inner}\n\n</DetailList>\n\n"


def paragraph_to_mdx(block: Block) -> str:
    level = heading_level(block.plain, block.style)
    if level:
        md = display_heading_text(
            runs_to_md(block.runs, force_body_weight=True),
            block.style,
        )
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


def segment_flow_to_mdx(seg: Segment, image_map: dict[str, str]) -> str:
    rail_blocks = [b for b in seg.blocks if b.kind == "profile"]
    main_blocks = [b for b in seg.blocks if b.kind != "profile"]
    has_rail = bool(rail_blocks)
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
    parts = ["---\n"]
    if seg.slug not in {"apresentacao", "resumo-executivo", *COUNTRY_OPENING_BY_SLUG.keys()}:
        parts.append(f'kicker: "{kicker}"\n')
    parts.extend(
        [
            "sheetVariant: vozes-report\n",
            "---\n\n",
            f"<VozesLayout{layout_attrs}>\n<VozesMain>\n\n",
        ]
    )
    if seg.slug in COUNTRY_OPENING_BY_SLUG:
        code, title = COUNTRY_OPENING_BY_SLUG[seg.slug]
        safe_title = title.replace('"', "&quot;")
        parts.append(f'<CountryOpening code="{code}" title="{safe_title}" />\n\n')
    profile_inserted = False
    for block in main_blocks:
        if block.kind == "list":
            parts.append(list_to_mdx(block))
        elif block.kind == "paragraph":
            level = heading_level(block.plain, block.style)
            parts.append(paragraph_to_mdx(block))
            if (
                not profile_inserted
                and level == 3
                and "governança" in block.plain.lower()
                and rail_blocks
            ):
                for profile in rail_blocks:
                    parts.append(profile_to_mdx(profile, image_map))
                profile_inserted = True
        elif block.kind == "image" and block.image_target:
            media = image_map.get(block.image_target, block.image_target)
            alt = f"Ilustração do documento ({media})."
            parts.append(
                f'<Figure src="media/{media}" alt={{{jsx_json(alt)}}} />\n\n'
            )
        elif block.kind == "table":
            cap = ""
            parts.append(table_to_mdx(block.rows, cap))
    parts.append("</VozesMain>\n")
    non_profile_rail = [b for b in rail_blocks if b.kind != "profile"]
    if non_profile_rail:
        parts.append("<VozesRail>\n\n")
        for block in non_profile_rail:
            parts.append(profile_to_mdx(block, image_map))
        parts.append("\n</VozesRail>\n")
    parts.append("</VozesLayout>\n")
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
            out: dict[str, str] = {
                "id": node_id(node["year"], i),
                "year": node["year"],
                "curriculo": node["curriculo"],
                "organizacao": node["organizacao"],
            }
            if node.get("resumo"):
                out["resumo"] = node["resumo"]
            out_nodes.append(out)
        payload = {
            "variant": "dual-track",
            "kicker": seg.kicker,
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


def run_import(
    blocks: list[Block],
    image_map: dict[str, str],
    *,
    source_label: str,
    list_pairs: set[tuple[str, str]] | None = None,
) -> int:
    """Write chapters, timelines, and document.json from parsed blocks. Returns section count."""
    if list_pairs is not None:
        blocks = coalesce_list_pairs_scoped(blocks, list_pairs)
    else:
        blocks = coalesce_list_pairs(blocks)
    blocks = coalesce_profiles(blocks)
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
        if block.kind in {"paragraph", "list", "profile"}:
            if block.kind == "profile":
                if current is not None:
                    current.blocks.append(block)
                continue
            plain = block.plain.strip()
            if plain == "ORGANIZAÇÕES":
                mode = "body"
                continue
            if plain in COUNTRY_HEADINGS:
                key, label, _code = COUNTRY_HEADINGS[plain]
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
            if is_cross_heading(plain):
                continue
            if (
                re.match(r"^2\.\s", plain)
                and current.kind == "flow"
                and current_country
                and current.slug == current_country
            ):
                org_panel_next = True
                current = start_segment("flow", f"{current_country}-org", current_country_label or current.kicker)
                segments.append(current)
                current.org_panel = True
                current.blocks.append(block)
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
            if not seg.blocks:
                continue
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
