#!/usr/bin/env python3
"""Import Organizações content from Mapeamento inventory.json (flattened blocks → tables)."""

from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path

from import_organizacoes_lib import (
    DEFAULT_MAPEAMENTO_CONTENT,
    DEFAULT_MAPEAMENTO_MEDIA,
    DEFAULT_ORGANIZACOES_DOCX,
    MAPEAMENTO_SNAPSHOT,
    MEDIA,
    Block,
    Run,
    list_pairs_from_docx,
    is_country_heading,
    is_role_description,
    join_label_subtitle,
    run_import,
)

YEAR_RE = re.compile(
    r"^(\d{4}(?:\s+a\s+\d{4})?|\d{4}\s*[-–]\s*\d{4})$"
)


def looks_like_year(text: str) -> bool:
    return bool(YEAR_RE.match(text.strip()))


def paragraph_block(text: str, style: str | None) -> Block:
    runs = [Run(text=text)]
    return Block(kind="paragraph", runs=runs, plain=text, style=style)


def inventory_items_to_blocks(items: list[dict]) -> list[Block]:
    blocks: list[Block] = []
    for item in items:
        text = (item.get("text") or "").strip()
        style = item.get("style")
        if text:
            blocks.append(paragraph_block(text, style))
        for img in item.get("images") or []:
            fname = img.get("file")
            if fname:
                blocks.append(Block(kind="image", image_target=fname))
    return blocks


def plain_at(blocks: list[Block], index: int) -> str | None:
    if index >= len(blocks) or blocks[index].kind != "paragraph":
        return None
    return blocks[index].plain.strip()


def eat_actors_table(blocks: list[Block], start: int) -> tuple[Block, int]:
    header = [plain_at(blocks, start) or "", plain_at(blocks, start + 1) or ""]
    i = start + 2
    rows: list[list[str]] = [header]
    while i < len(blocks):
        if blocks[i].kind != "paragraph":
            break
        a = plain_at(blocks, i)
        if not a:
            break
        if is_country_heading(a) or looks_like_year(a) or a == "Ano":
            break
        if re.match(r"^\d+\.\d+\.", a):
            break
        b = plain_at(blocks, i + 1) if i + 1 < len(blocks) else None
        if not b:
            break
        c = plain_at(blocks, i + 2) if i + 2 < len(blocks) else None
        if is_role_description(b):
            rows.append([a, b])
            i += 2
            continue
        if c and is_role_description(c):
            rows.append([join_label_subtitle(a, b), c])
            i += 3
            continue
        break
    return Block(kind="table", rows=rows), i


def eat_cross_table(blocks: list[Block], start: int) -> tuple[Block, int]:
    rows: list[list[str]] = [["Ano", "Currículo", "Organização"]]
    i = start + 3
    while i < len(blocks):
        if blocks[i].kind != "paragraph":
            break
        year = plain_at(blocks, i)
        if year is None:
            break
        if is_country_heading(year):
            break
        if not looks_like_year(year):
            break
        if i + 2 >= len(blocks):
            break
        cur = plain_at(blocks, i + 1) or ""
        org = plain_at(blocks, i + 2) or ""
        rows.append([year, cur, org])
        i += 3
        while i < len(blocks) and blocks[i].kind == "paragraph":
            cont = plain_at(blocks, i) or ""
            if is_country_heading(cont) or looks_like_year(cont):
                break
            if re.match(r"^\d+\.\s", cont) and "Onde as trajetórias" not in cont:
                break
            rows.append(["", cont, ""])
            i += 1
    return Block(kind="table", rows=rows), i


def eat_ano_marco_table(blocks: list[Block], start: int, header_label: str) -> tuple[Block, int]:
    rows: list[list[str]] = [["Ano", header_label]]
    i = start + 2
    while i + 1 < len(blocks):
        if blocks[i].kind != "paragraph":
            break
        year = plain_at(blocks, i)
        if year is None:
            break
        if is_country_heading(year):
            break
        if not looks_like_year(year):
            break
        marco = plain_at(blocks, i + 1) or ""
        rows.append([year, marco])
        i += 2
    return Block(kind="table", rows=rows), i


def eat_ks_table(blocks: list[Block], start: int) -> tuple[Block, int]:
    header = ["Etapas"]
    for j in range(1, 5):
        header.append(plain_at(blocks, start + j) or "")
    i = start + 5
    rows: list[list[str]] = [header]
    while i < len(blocks) and blocks[i].kind == "paragraph":
        label = plain_at(blocks, i) or ""
        if is_country_heading(label):
            break
        if label in {"Ator", "Ano", "Canais de participação"} or re.match(r"^\d+\.\d+\.", label):
            break
        if i + 4 >= len(blocks):
            break
        cells = [label]
        j = i + 1
        for _ in range(4):
            val = plain_at(blocks, j) or ""
            if j + 1 < len(blocks) and (plain_at(blocks, j + 1) or "") == "anos":
                val = f"{val}anos"
                j += 2
            else:
                j += 1
            cells.append(val)
        if len(cells) == 5:
            rows.append(cells)
        i = j
        if label == "Anos escolares":
            break
    return Block(kind="table", rows=rows), i


def eat_chile_levels_table(blocks: list[Block], start: int) -> tuple[Block, int]:
    pairs = []
    for off in (0, 2, 4):
        a = plain_at(blocks, start + off) or ""
        b = plain_at(blocks, start + off + 1) or ""
        pairs.append(join_label_subtitle(a, b))
    return Block(kind="table", rows=[pairs]), start + 6


def coalesce_inventory_tables(blocks: list[Block]) -> list[Block]:
    out: list[Block] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        if block.kind != "paragraph":
            out.append(block)
            i += 1
            continue

        text = block.plain.strip()
        n1 = plain_at(blocks, i + 1)
        n2 = plain_at(blocks, i + 2)

        if text == "Ator" and n1 and "Papel" in n1:
            table, i = eat_actors_table(blocks, i)
            out.append(table)
            continue

        if text == "Ano" and n1 == "Currículo" and n2 == "Organização":
            table, i = eat_cross_table(blocks, i)
            out.append(table)
            continue

        if text == "Ano" and n1 in {"Marco", "Marco da organização"}:
            table, i = eat_ano_marco_table(blocks, i, n1)
            out.append(table)
            continue

        if text == "Etapas" and n1 and n1.startswith("KS "):
            table, i = eat_ks_table(blocks, i)
            out.append(table)
            continue

        if text == "Educación Parvularia" and n2 == "Educación Básica":
            table, i = eat_chile_levels_table(blocks, i)
            out.append(table)
            continue

        out.append(block)
        i += 1

    return out


def load_inventory(path: Path) -> tuple[list[Block], set[tuple[str, str]]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    docx = Path(os.environ.get("ORGANIZACOES_DOCX", str(DEFAULT_ORGANIZACOES_DOCX)))
    list_pairs = list_pairs_from_docx(docx)
    raw = inventory_items_to_blocks(data.get("blocks") or [])
    return coalesce_inventory_tables(raw), list_pairs


def copy_inventory_images(
    items: list[dict],
    media_dir: Path,
    image_map: dict[str, str],
) -> None:
    MEDIA.mkdir(parents=True, exist_ok=True)
    seen: set[str] = set()
    for item in items:
        for img in item.get("images") or []:
            fname = img.get("file")
            if not fname or fname in seen:
                continue
            seen.add(fname)
            src = None
            disk = img.get("disk")
            if disk and Path(disk).is_file():
                src = Path(disk)
            else:
                candidate = media_dir / fname
                if candidate.is_file():
                    src = candidate
            if src is None:
                print(f"Warning: missing image {fname}")
                continue
            target = f"org-{fname}"
            shutil.copy2(src, MEDIA / target)
            image_map[fname] = target

    for png in sorted(media_dir.glob("image*.png")):
        target = f"org-{png.name}"
        if png.name not in image_map:
            shutil.copy2(png, MEDIA / target)
            image_map[png.name] = target


def resolve_inventory_path() -> Path:
    env = os.environ.get("MAPEAMENTO_INVENTORY")
    if env:
        p = Path(env)
        if p.is_file():
            return p
        raise SystemExit(f"MAPEAMENTO_INVENTORY not found: {p}")
    snap = MAPEAMENTO_SNAPSHOT / "inventory.json"
    if snap.is_file():
        return snap
    fallback = DEFAULT_MAPEAMENTO_CONTENT / "inventory.json"
    if fallback.is_file():
        return fallback
    raise SystemExit(
        "No inventory found. Run npm run snapshot:mapeamento or set MAPEAMENTO_INVENTORY."
    )


def main() -> None:
    inv_path = resolve_inventory_path()
    media_dir = Path(os.environ.get("MAPEAMENTO_MEDIA", str(DEFAULT_MAPEAMENTO_MEDIA)))
    if not media_dir.is_dir():
        raise SystemExit(f"Missing docx media dir: {media_dir}")

    data = json.loads(inv_path.read_text(encoding="utf-8"))
    blocks, list_pairs = load_inventory(inv_path)
    pairs_path = MAPEAMENTO_SNAPSHOT / "list-pairs.json"
    pairs_path.write_text(
        json.dumps([list(pair) for pair in sorted(list_pairs)], ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    image_map: dict[str, str] = {}
    copy_inventory_images(data.get("blocks") or [], media_dir, image_map)

    run_import(blocks, image_map, source_label=inv_path.name, list_pairs=list_pairs)


if __name__ == "__main__":
    main()
