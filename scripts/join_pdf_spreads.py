#!/usr/bin/env python3
"""Junta folhas A4 em duplas (leitura digital), preservando links (pypdf merge, não raster)."""
from __future__ import annotations

import sys
from pathlib import Path

import re

from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import ArrayObject, DictionaryObject, FloatObject, NameObject

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


def folio_to_output_page(folio: int, page_count: int) -> int:
    """Fólio 1-based → índice 0-based da página no PDF de duplas."""
    if page_count < 1 or folio < 1:
        return 0
    sheet_index = min(folio - 1, page_count - 1)
    plan = plan_digital_reading_spreads(page_count)
    for out_i, item in enumerate(plan):
        if item["kind"] == "single" and item["page"] == sheet_index:
            return out_i
        if item["kind"] == "spread" and sheet_index in (item["left"], item["right"]):
            return out_i
    return min(sheet_index, max(len(plan) - 1, 0))


def _spread_xyz_dest(writer: PdfWriter, output_index: int) -> ArrayObject:
    return ArrayObject(
        [
            writer.pages[output_index].indirect_reference,
            NameObject("/XYZ"),
            FloatObject(0),
            FloatObject(A4_HEIGHT_PT),
            FloatObject(0),
        ]
    )


def install_spread_destinations(writer: PdfWriter, source_page_count: int) -> None:
    """
    Chromium grava `/Dest /page-N` nas anotações; o catálogo `/Dests` do A4 aponta para folhas
    individuais. No PDF de duplas, recriamos o catálogo para cada fólio e unidade de leitura.
    """
    dests = DictionaryObject()
    for folio in range(1, source_page_count + 1):
        out_index = folio_to_output_page(folio, source_page_count)
        dests[NameObject(f"/page-{folio}")] = _spread_xyz_dest(writer, out_index)

    for unit in range(1, len(writer.pages) + 1):
        dests[NameObject(f"/reading-{unit}")] = _spread_xyz_dest(writer, unit - 1)

    root = writer._root_object  # noqa: SLF001 — pypdf não expõe API pública para /Dests
    root[NameObject("/Dests")] = dests


def _set_named_dest(annot: DictionaryObject, dest_name: str) -> None:
    if "/A" in annot:
        del annot[NameObject("/A")]
    annot[NameObject("/Dest")] = NameObject(dest_name if dest_name.startswith("/") else f"/{dest_name}")


def remap_sumario_destinations(writer: PdfWriter, source_page_count: int) -> None:
    """Sumário e links internos: destinos por fólio A4 → dupla correta no PDF de leitura."""
    install_spread_destinations(writer, source_page_count)

    page_pat = re.compile(r"^/?page-(\d+)$")
    reading_pat = re.compile(r"^/?reading-(\d+)$")

    for page in writer.pages:
        annots = page.get("/Annots")
        if not annots:
            continue
        for ref in annots:
            annot = ref.get_object()
            if annot.get("/Subtype") != "/Link":
                continue

            dest = annot.get("/Dest")
            if dest is not None:
                # Anotação já usa nome; o catálogo `/Dests` foi remapeado acima.
                continue

            action = annot.get("/A")
            if action is None:
                continue
            action = action.get_object()
            if action.get("/S") != "/URI":
                continue
            uri = action.get("/URI")
            if uri is None:
                continue
            uri_text = uri.decode("latin-1") if isinstance(uri, bytes) else str(uri)
            hash_idx = uri_text.find("#")
            if hash_idx < 0:
                continue
            fragment = uri_text[hash_idx + 1 :]
            page_match = page_pat.match(fragment)
            reading_match = reading_pat.match(fragment)
            if page_match:
                folio = int(page_match.group(1))
                _set_named_dest(annot, f"/page-{folio}")
            elif reading_match:
                unit = int(reading_match.group(1))
                _set_named_dest(annot, f"/reading-{unit}")


def join_pdf_spreads(input_path: Path, output_path: Path) -> None:
    reader = PdfReader(str(input_path))
    page_count = len(reader.pages)
    if page_count < 1:
        raise ValueError("PDF de origem não tem páginas.")

    plan = plan_digital_reading_spreads(page_count)
    writer = PdfWriter()
    for item in plan:
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

    # Se o Chromium fragmentar conteúdo para a folha seguinte, os links saem da
    # dupla certa silenciosamente (ex.: a parte B do sumário cai na folha 6).
    # Cada unidade de leitura deve manter exatamente os links das folhas A4 que a compõem.
    for index, item in enumerate(plan):
        if item["kind"] == "single":
            expected = len(reader.pages[item["page"]].get("/Annots") or [])
        else:
            expected = len(reader.pages[item["left"]].get("/Annots") or []) + len(
                reader.pages[item["right"]].get("/Annots") or []
            )
        actual = len(writer.pages[index].get("/Annots") or [])
        if actual != expected:
            raise ValueError(
                f"A unidade {index + 1} perdeu links na junção ({actual} de {expected}). "
                "Alguma folha foi fragmentada para a página seguinte no PDF A4."
            )

    source_sumario_links = 0
    for sheet_index in (3, 4):
        if sheet_index < page_count:
            sheet_links = len(reader.pages[sheet_index].get("/Annots") or [])
            if sheet_links == 0:
                raise ValueError(
                    f"A folha {sheet_index + 1} do sumário não tem links. "
                    "O miolo pode ter sido fragmentado para a folha seguinte no PDF A4."
                )
            source_sumario_links += sheet_links
    if source_sumario_links < 10:
        raise ValueError(
            "O PDF A4 não tem links no sumário (folhas 4–5). "
            "O export do Chromium precisa de href `#page-N` nos itens do sumário."
        )

    remap_sumario_destinations(writer, page_count)

    sumario_spread_index = folio_to_output_page(4, page_count)
    sumario_links = writer.pages[sumario_spread_index].get("/Annots") or []
    if len(sumario_links) < 10:
        raise ValueError(
            f"Junção das duplas perdeu links do sumário ({len(sumario_links)} < 10)."
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