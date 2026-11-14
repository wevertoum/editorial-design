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
    if (href.startsWith('#')) node.setAttribute('href', `${base}${href}`)
    else if (href.startsWith('/')) node.setAttribute('href', `${window.location.origin}${href}`)
  }
}