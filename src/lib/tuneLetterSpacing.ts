/**
 * Ajuste fino de entreletras para evitar rabos de linha (última linha muito curta).
 * Unidades no mesmo espírito do tracking tipográfico: ±15 ≡ ±0,015em no corpo.
 */

export const TRACKING_UNIT_EM = 0.001
export const TRACKING_LIMIT = 15

const APRESENTACAO_SELECTOR = '.vozes-chapter--apresentacao .vozes-main > p'

function measureLines(paragraph: HTMLElement, widthPx: number, letterSpacingEm: number): string[] {
  const clone = paragraph.cloneNode(true) as HTMLElement
  clone.style.position = 'absolute'
  clone.style.visibility = 'hidden'
  clone.style.pointerEvents = 'none'
  clone.style.left = '-9999px'
  clone.style.width = `${widthPx}px`
  clone.style.letterSpacing = `${letterSpacingEm}em`
  document.body.appendChild(clone)

  const words = (clone.textContent ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    clone.remove()
    return []
  }

  clone.innerHTML = words.map((w) => `<span>${w}</span>`).join(' ')
  const spans = [...clone.querySelectorAll('span')]
  const lines: string[] = []
  let curTop: number | null = null
  let cur: string[] = []

  for (const span of spans) {
    const top = span.offsetTop
    if (curTop !== null && top !== curTop) {
      lines.push(cur.join(' '))
      cur = []
    }
    curTop = top
    cur.push(span.textContent ?? '')
  }
  if (cur.length) lines.push(cur.join(' '))

  clone.remove()
  return lines
}

function lastLineIsRabo(
  lines: string[],
  paragraphWidth: number,
  letterSpacingEm: number,
  ref: HTMLElement,
): boolean {
  if (lines.length < 2) return false
  const last = lines[lines.length - 1]!
  const words = last.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 2) return true

  const refStyle = getComputedStyle(ref)
  const probe = document.createElement('p')
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.left = '-9999px'
  probe.style.width = `${paragraphWidth}px`
  probe.style.letterSpacing = `${letterSpacingEm}em`
  probe.style.font = refStyle.font
  probe.textContent = last
  document.body.appendChild(probe)
  const lastWidth = probe.scrollWidth
  probe.remove()

  return lastWidth < paragraphWidth * 0.38
}

function tuneParagraph(paragraph: HTMLElement): void {
  paragraph.style.letterSpacing = ''
  const width = paragraph.clientWidth
  if (width <= 0) return

  const measureAt = (units: number) => {
    const em = units * TRACKING_UNIT_EM
    paragraph.style.letterSpacing = `${em}em`
    const lines = measureLines(paragraph, width, em)
    const rabo = lastLineIsRabo(lines, width, em, paragraph)
    return { units, em, lines, rabo }
  }

  const baseline = measureAt(0)
  if (!baseline.rabo) {
    paragraph.style.letterSpacing = ''
    return
  }

  let best: { units: number; em: number } | null = null

  for (let units = 1; units <= TRACKING_LIMIT; units++) {
    const trial = measureAt(units)
    if (!trial.rabo) {
      best = { units: trial.units, em: trial.em }
      break
    }
  }

  if (!best) {
    for (let units = -1; units >= -TRACKING_LIMIT; units--) {
      const trial = measureAt(units)
      if (!trial.rabo) {
        best = { units: trial.units, em: trial.em }
        break
      }
    }
  }

  if (best) {
    paragraph.style.letterSpacing = `${best.em}em`
    paragraph.dataset.vozesTracking = String(best.units)
  } else {
    paragraph.style.letterSpacing = ''
    delete paragraph.dataset.vozesTracking
  }
}

export function applyApresentacaoTrackingTuning(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>(APRESENTACAO_SELECTOR).forEach((p) => {
    tuneParagraph(p)
  })
}