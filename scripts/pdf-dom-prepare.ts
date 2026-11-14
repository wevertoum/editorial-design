/// <reference lib="dom" />

/** Roda no Chromium antes do `page.pdf()` — ver build-pdf.ts */
export function prepareDomForPdfExportInBrowser() {
  const desk = document.querySelector('.desk')
  if (!(desk instanceof HTMLElement)) return

  const pages = [...desk.querySelectorAll('.sheet-page')]
  if (pages.length > 0) desk.replaceChildren(...pages)

  const base = `${window.location.origin}${window.location.pathname}`
  for (const node of desk.querySelectorAll('a[href]')) {
    const href = node.getAttribute('href')
    if (!href || href.startsWith('mailto:') || /^https?:/i.test(href)) continue

    if (node instanceof HTMLAnchorElement && node.classList.contains('sumario-entry-link')) {
      const folio = node.dataset.folio
      if (folio) {
        node.setAttribute('href', `${base}#page-${folio}`)
        continue
      }
      const reading = href.match(/#reading-(\d+)$/)
      if (reading) {
        const unit = document.getElementById(`reading-${reading[1]}`)
        const leaf = unit?.querySelector<HTMLElement>('.sheet-page[id^="page-"]')
        const leafId = leaf?.id?.replace(/^page-/, '')
        if (leafId) {
          node.setAttribute('href', `${base}#page-${leafId}`)
          continue
        }
      }
    }

    if (href.startsWith('#reading-')) {
      const reading = href.match(/^#reading-(\d+)$/)
      if (reading) {
        const unit = document.querySelector(`.spread-fit#reading-${reading[1]}`)
        const leaf = unit?.querySelector<HTMLElement>('.sheet-page[id^="page-"]')
        const leafId = leaf?.id
        if (leafId) {
          node.setAttribute('href', `${base}#${leafId}`)
          continue
        }
      }
    }

    if (href.startsWith('#')) node.setAttribute('href', `${base}${href}`)
    else if (href.startsWith('/')) node.setAttribute('href', `${window.location.origin}${href}`)
  }
}