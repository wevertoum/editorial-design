#!/usr/bin/env python3
"""Junta folhas A4 em duplas (leitura digital), preservando links (pypdf merge, não raster)."""
from __future__ import annotations

import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter, Transformation

A4_WIDTH_PT = 595.28
A4_HEIGHT_PT = 841.89
SPREAD_GUTTER_PT = 1.5
SPREAD_WIDTH_PT = A4_WIDTH_PT * 2 + SPREAD_GUTTER_PT


def plan_digital_reading_spreads(page_count: int) -> list[dict]:
    if page_count < 1:
        return []
    if page_count == 1:
        return [{"kind": "single", "page": 0}]
    if page_count == 2:
        return [{"kind": "single", "page": 0}, {"kind": "single", "page": 1}]

    plan: list[dict] = [{"kind": "single", "page": 0}]
    middle_end = page_count - 2

    index = 1
    while index <= middle_end:
        if index + 1 <= middle_end:
            plan.append({"kind": "spread", "left": index, "right": index + 1})
            index += 2
        else:
            plan.append({"kind": "single", "page": index})
            index += 1

    plan.append({"kind": "single", "page": page_count - 1})
    return plan


def join_pdf_spreads(input_path: Path, output_path: Path) -> None:
    reader = PdfReader(str(input_path))
    page_count = len(reader.pages)
    if page_count < 1:
        raise ValueError("PDF de origem não tem páginas.")

    writer = PdfWriter()
    for item in plan_digital_reading_spreads(page_count):
        if item["kind"] == "single":
            writer.add_page(reader.pages[item["page"]])
            continue

        spread = writer.add_blank_page(width=SPREAD_WIDTH_PT, height=A4_HEIGHT_PT)
        spread.merge_transformed_page(
            reader.pages[item["left"]],
            Transformation().translate(tx=0, ty=0),
            expand=False,
        )
        spread.merge_transformed_page(
            reader.pages[item["right"]],
            Transformation().translate(tx=A4_WIDTH_PT + SPREAD_GUTTER_PT, ty=0),
            expand=False,
        )

    with output_path.open("wb") as handle:
        writer.write(handle)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: join_pdf_spreads.py <input.pdf> <output.pdf>", file=sys.stderr)
        return 1
    inp = Path(sys.argv[1])
    out = Path(sys.argv[2])
    join_pdf_spreads(inp, out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())