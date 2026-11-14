import { readFileSync, writeFileSync } from 'node:fs'
import { PDFDocument, type PDFPage } from 'pdf-lib'

/** A4 trim in pt (matches Chromium digital export). */
export const A4_WIDTH_PT = 595.28
export const A4_HEIGHT_PT = 841.89
/** ~2px gutter between folhas na dupla da mesa. */
export const SPREAD_GUTTER_PT = 1.5
export const SPREAD_WIDTH_PT = A4_WIDTH_PT * 2 + SPREAD_GUTTER_PT

export type SpreadPlanItem =
  | { kind: 'single'; page: number }
  | { kind: 'spread'; left: number; right: number }

/**
 * Leitura digital: 1ª e última folha sozinhas (A4); miolo em duplas,
 * como na mesa exceto pelas pontas do documento.
 */
export function planDigitalReadingSpreads(pageCount: number): SpreadPlanItem[] {
  if (pageCount < 1) return []
  if (pageCount === 1) return [{ kind: 'single', page: 0 }]
  if (pageCount === 2) {
    return [
      { kind: 'single', page: 0 },
      { kind: 'single', page: 1 },
    ]
  }

  const plan: SpreadPlanItem[] = [{ kind: 'single', page: 0 }]
  const middleEnd = pageCount - 2

  for (let index = 1; index <= middleEnd; index += 2) {
    if (index + 1 <= middleEnd) {
      plan.push({ kind: 'spread', left: index, right: index + 1 })
    } else {
      plan.push({ kind: 'single', page: index })
    }
  }

  plan.push({ kind: 'single', page: pageCount - 1 })
  return plan
}

/** @deprecated Usar `planDigitalReadingSpreads`. Mantido para testes legados. */
export function planSpreads(pageCount: number): SpreadPlanItem[] {
  return planDigitalReadingSpreads(pageCount)
}

export async function joinPdfSpreads(sourceBytes: Uint8Array): Promise<Uint8Array> {
  const source = await PDFDocument.load(sourceBytes, { ignoreEncryption: true })
  const pageCount = source.getPageCount()
  if (pageCount < 1) {
    throw new Error('PDF de origem não tem páginas.')
  }

  const plan = planDigitalReadingSpreads(pageCount)
  const out = await PDFDocument.create()

  for (const item of plan) {
    if (item.kind === 'single') {
      const page = out.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])
      await placePage(out, source, page, item.page, 0)
      continue
    }

    const spread = out.addPage([SPREAD_WIDTH_PT, A4_HEIGHT_PT])
    await placePage(out, source, spread, item.left, 0)
    await placePage(out, source, spread, item.right, A4_WIDTH_PT + SPREAD_GUTTER_PT)
  }

  return out.save()
}

async function placePage(
  out: PDFDocument,
  source: PDFDocument,
  target: PDFPage,
  sourceIndex: number,
  x: number,
) {
  const [embedded] = await out.embedPages([source.getPage(sourceIndex)])
  target.drawPage(embedded, {
    x,
    y: 0,
    width: A4_WIDTH_PT,
    height: A4_HEIGHT_PT,
  })
}

export function joinPdfSpreadsFromFile(inputPath: string, outputPath: string): Promise<void> {
  return joinPdfSpreads(readFileSync(inputPath)).then((bytes) => {
    writeFileSync(outputPath, bytes)
  })
}