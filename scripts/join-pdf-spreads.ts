import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

const joinScript = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'join_pdf_spreads.py')

/**
 * Junta duplas com pypdf (merge + translate), preservando anotações de link.
 * pdf-lib `drawPage` rasterizava o miolo e apagava hyperlinks.
 */
export async function joinPdfSpreads(sourceBytes: Uint8Array): Promise<Uint8Array> {
  const work = mkdtempSync(path.join(tmpdir(), 'vozes-spread-'))
  const input = path.join(work, 'source.pdf')
  const output = path.join(work, 'spread.pdf')
  try {
    writeFileSync(input, sourceBytes)
    const result = spawnSync('python3', [joinScript, input, output], { encoding: 'utf8' })
    if (result.status !== 0) {
      throw new Error(
        result.stderr?.trim() || result.stdout?.trim() || 'join_pdf_spreads.py falhou',
      )
    }
    return readFileSync(output)
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

export function joinPdfSpreadsFromFile(inputPath: string, outputPath: string): Promise<void> {
  return joinPdfSpreads(readFileSync(inputPath)).then((bytes) => {
    writeFileSync(outputPath, bytes)
  })
}