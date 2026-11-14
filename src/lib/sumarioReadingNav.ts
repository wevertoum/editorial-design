import { folioToReadingUnitNumber } from './readingSpreadPlan'

const PAGE_HASH_RE = /^#page-(\d+)$/
const READING_HASH_RE = /^#reading-(\d+)$/

function pageCountFromDocument(): number {
  const raw = document.documentElement.dataset.pageCount
  const n = raw ? Number(raw) : Number.NaN
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Rolagem até a dupla (spread-fit) que contém o fólio — não só metade da tela. */
export function scrollToFolio(folio: number, behavior: ScrollBehavior = 'smooth'): boolean {
  const page = document.getElementById(`page-${folio}`)
  if (!page) return false
  const spread = page.closest('.spread-fit')
  ;(spread ?? page).scrollIntoView({ behavior, block: 'start' })
  return true
}

export function scrollToReadingUnit(unitNumber: number, behavior: ScrollBehavior = 'smooth'): boolean {
  const spread = document.getElementById(`reading-${unitNumber}`)
  if (!spread) return false
  spread.scrollIntoView({ behavior, block: 'start' })
  return true
}

/** Só marca o fólio; o href fica `#page-N` para o Chromium gerar `/Dest` no PDF. */
function stampSumarioFolioLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('.sumario-entry-link[href]').forEach((link) => {
    const href = link.getAttribute('href') ?? ''
    const match = href.match(PAGE_HASH_RE) ?? (href.includes('#page-') ? href.match(/#page-(\d+)$/) : null)
    if (!match) {
      const reading = href.match(READING_HASH_RE)
      if (reading) link.dataset.folio = String(folioFromReadingUnit(Number(reading[1])))
      return
    }
    const folio = Number(match[1])
    if (!Number.isFinite(folio)) return
    link.dataset.folio = String(folio)
  })
}

function folioFromReadingUnit(unit: number): number | null {
  const spread = document.getElementById(`reading-${unit}`)
  if (!spread) return null
  const leaf = spread.querySelector<HTMLElement>('.sheet-page[id^="page-"]')
  const id = leaf?.id ?? ''
  const m = id.match(/^page-(\d+)$/)
  return m ? Number(m[1]) : null
}

function onSumarioClick(event: MouseEvent): void {
  const target = event.target
  if (!(target instanceof Element)) return
  const link = target.closest<HTMLAnchorElement>('.sumario-entry-link')
  if (!link) return

  const pageCount = pageCountFromDocument()
  const folio = link.dataset.folio ? Number(link.dataset.folio) : Number.NaN
  let unit: number | null = null

  const href = link.getAttribute('href') ?? ''
  const readingMatch = href.match(READING_HASH_RE)
  if (readingMatch) {
    unit = Number(readingMatch[1])
  } else if (Number.isFinite(folio) && pageCount > 0) {
    unit = folioToReadingUnitNumber(folio, pageCount)
  } else {
    const pageMatch = href.match(PAGE_HASH_RE)
    if (pageMatch && pageCount > 0) {
      unit = folioToReadingUnitNumber(Number(pageMatch[1]), pageCount)
    }
  }

  if (unit !== null && Number.isFinite(unit) && scrollToReadingUnit(unit)) {
    event.preventDefault()
    history.pushState(null, '', `#reading-${unit}`)
  }
}

function scrollFromLocationHash(): void {
  const hash = window.location.hash
  if (!hash) return

  const readingMatch = hash.match(READING_HASH_RE)
  if (readingMatch) {
    scrollToReadingUnit(Number(readingMatch[1]), 'auto')
    return
  }

  const pageMatch = hash.match(PAGE_HASH_RE)
  if (pageMatch) {
    scrollToFolio(Number(pageMatch[1]), 'auto')
  }
}

let installed = false

export function installSumarioReadingNav(): void {
  if (document.documentElement.dataset.pagesReady !== '1') return
  teardownSumarioReadingNav()

  stampSumarioFolioLinks()

  document.addEventListener('click', onSumarioClick)
  window.addEventListener('hashchange', scrollFromLocationHash)
  scrollFromLocationHash()

  installed = true
}

export function teardownSumarioReadingNav(): void {
  if (!installed) return
  document.removeEventListener('click', onSumarioClick)
  window.removeEventListener('hashchange', scrollFromLocationHash)
  installed = false
}