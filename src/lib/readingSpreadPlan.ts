/**
 * Mesma lógica da mesa (arrangeSpreads) e do PDF de leitura (`gerar-pdf-leitura`).
 * Índices de folha A4 = 0-based; fólio do sumário = 1-based.
 */

export type ReadingSpreadPlanItem =
  | { kind: 'single'; page: number }
  | { kind: 'spread'; left: number; right: number }

/** 1ª e última folha sozinhas; miolo em duplas. */
export function planDigitalReadingSpreads(pageCount: number): ReadingSpreadPlanItem[] {
  if (pageCount < 1) return []
  if (pageCount === 1) return [{ kind: 'single', page: 0 }]
  if (pageCount === 2) {
    return [
      { kind: 'single', page: 0 },
      { kind: 'single', page: 1 },
    ]
  }

  const plan: ReadingSpreadPlanItem[] = [{ kind: 'single', page: 0 }]
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

/** Fólio (1-based) → índice 0-based da unidade na mesa / no PDF spread. */
export function folioToReadingUnitIndex(folio: number, pageCount: number): number {
  if (pageCount < 1 || folio < 1) return 0
  const sheetIndex = Math.min(folio - 1, pageCount - 1)
  const plan = planDigitalReadingSpreads(pageCount)
  for (let unit = 0; unit < plan.length; unit++) {
    const item = plan[unit]
    if (item.kind === 'single' && item.page === sheetIndex) return unit
    if (item.kind === 'spread' && (item.left === sheetIndex || item.right === sheetIndex)) return unit
  }
  return Math.max(0, Math.min(sheetIndex, plan.length - 1))
}

/** Número 1-based da unidade de leitura (`#reading-3` na mesa). */
export function folioToReadingUnitNumber(folio: number, pageCount: number): number {
  return folioToReadingUnitIndex(folio, pageCount) + 1
}

export function readingUnitHash(unitNumber: number): string {
  return `#reading-${unitNumber}`
}

export function folioToReadingHash(folio: number, pageCount: number): string {
  return readingUnitHash(folioToReadingUnitNumber(folio, pageCount))
}