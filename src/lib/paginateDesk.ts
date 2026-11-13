/**
 * Splits each section into A4 pages for the on-screen preview.
 * The PDF prints those same pages, so the desk and the file match.
 */

const SLOP = 2

const ATOMIC = [
  '.figure',
  '.profile-card',
  '.editorial-table',
  '.pull-quote',
  '.highlight',
  '.callout-card',
  '.actor-band',
  '.dimension-list-item',
  '.detail-list-item',
  '.facts-rail',
  '.country-opening',
  '.dual-track',
  '.dual-track-section',
  '.infographic',
  '.cover-hero',
  '.folha-rosto-hero',
  '.vozes-page-stack-foot',
  '.vozes-detail-list-grid',
  '.timeline-event',
  '.milestone-strip-item',
  '.masthead',
  'table',
].join(', ')

export function paginateInto(source: HTMLElement, desk: HTMLElement): () => void {
  let cancelled = false

  const run = () => {
    if (cancelled) return
    const sheets = [...source.children].filter((node): node is HTMLElement => node instanceof HTMLElement && node.classList.contains('sheet'))
    const pages: HTMLElement[] = []
    let pageNumber = 1
    for (const sheet of sheets) {
      const built = paginateSheet(sheet, pageNumber)
      pages.push(...built)
      pageNumber += built.length
    }
    desk.replaceChildren(...arrangeSpreads(pages))
    document.documentElement.dataset.pagesReady = '1'
    document.documentElement.dataset.pageCount = String(pages.length)
  }

  void (async () => {
    await document.fonts.ready
    const images = [...source.querySelectorAll('img')]
    await Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve())))
    run()
  })()

  return () => {
    cancelled = true
    delete document.documentElement.dataset.pagesReady
  }
}

function paginateSheet(sheet: HTMLElement, startPage: number): HTMLElement[] {
  const limit = pageLimitPx()
  const main = sheet.querySelector(':scope > .vozes-page > .vozes-main')
  const probe = createProbe(sheet)
  try {
    if (main) {
      const blocks = elementChildren(main).map((node) => node.cloneNode(true) as HTMLElement)
      if (probe.measure(blocks, true) <= limit + SLOP) {
        return [cloneWhole(sheet, startPage)]
      }
      const groups = groupBlocks(blocks, limit, probe.measure)
      return groups.map((nodes, index) =>
        renderGroup(sheet, nodes, startPage + index, index === 0, index === 0),
      )
    }

    const blocks = elementChildren(sheet).map((node) => node.cloneNode(true) as HTMLElement)
    if (probe.measure(blocks, false) <= limit + SLOP) {
      return [cloneWhole(sheet, startPage)]
    }
    const groups = groupBlocks(blocks, limit, probe.measure)
    return groups.map((nodes, index) =>
      renderGroup(sheet, nodes, startPage + index, false, index === 0),
    )
  } finally {
    probe.destroy()
  }
}

function groupBlocks(
  blocks: HTMLElement[],
  limit: number,
  measure: (nodes: HTMLElement[], withRail: boolean) => number,
): HTMLElement[][] {
  const queue = blocks.filter((block) => !isSkippable(block))
  const groups: HTMLElement[][] = []
  let current: HTMLElement[] = []
  let guard = 0

  const isFirst = () => groups.length === 0
  const fits = (nodes: HTMLElement[], withRail: boolean) => measure(nodes, withRail) <= limit + SLOP

  while (queue.length > 0 && guard++ < 4000) {
    const block = queue.shift()
    if (!block) break
    const next = queue[0]
    const withRail = isFirst()

    if (block.classList.contains('vozes-page-start') && current.length > 0) {
      groups.push(current)
      current = []
      queue.unshift(block)
      continue
    }

    if (block.classList.contains('vozes-page-stack') && block.classList.contains('vozes-page-break') && current.length > 0) {
      groups.push(current)
      current = []
    }

    if (block.classList.contains('vozes-page-stack')) {
      if (current.length > 0) {
        groups.push(current)
        current = []
      }
      /* Faixa marfim + overflow na mesma folha: não partir prelúdio do dual-track. */
      if (
        block.classList.contains('vozes-page-stack--dual-track') ||
        block.classList.contains('vozes-page-stack--trajetoria-sheet')
      ) {
        groups.push([block])
        continue
      }
      if (fits([block], false)) {
        groups.push([block])
        continue
      }
      const stackClass = block.className
      const inner = groupBlocks(elementChildren(block), limit, measure)
      for (const nodes of inner) {
        const stack = document.createElement('div')
        stack.className = stackClass
        nodes.forEach((node) => stack.appendChild(node))
        groups.push(coalesceTables([stack]))
      }
      continue
    }

    if (isHeading(block) && next && current.length > 0 && !fits([...current, block, next], withRail)) {
      const governanceHead = block.matches('h3') && next.classList.contains('profile-card')
      if (governanceHead) {
        const bundle = [block, next]
        let cur = [...current]
        const peeled: HTMLElement[] = []
        while (cur.length > 0 && !fits([...cur, ...bundle], withRail)) {
          peeled.unshift(cur.pop()!)
          if (peeled.length > 8) break
        }
        if (peeled.length > 0 && cur.length > 0 && fits([...cur, ...bundle], withRail)) {
          current = [...cur, ...bundle]
          queue.shift()
          queue.unshift(...peeled)
          continue
        }
      }
      groups.push(current)
      current = []
      queue.unshift(block)
      continue
    }

    const candidate = [...current, block]
    if (current.length > 0 && !fits(candidate, withRail)) {
      if (block.classList.contains('profile-card')) {
        let cur = [...current]
        const peeled: HTMLElement[] = []
        while (cur.length > 0 && !fits([...cur, block], withRail)) {
          peeled.unshift(cur.pop()!)
          if (peeled.length > 8) break
        }
        if (peeled.length > 0 && cur.length > 0 && fits([...cur, block], withRail)) {
          current = [...cur, block]
          queue.unshift(...peeled)
          continue
        }
      }
      const parts = breakApart(block, limit, measure)
      if (parts.length > 1) {
        queue.unshift(...parts)
        continue
      }
      groups.push(current)
      current = []
      queue.unshift(block)
      continue
    }

    if (current.length === 0 && !fits([block], withRail)) {
      const parts = breakApart(block, limit, measure)
      if (parts.length <= 1) {
        groups.push([block])
        continue
      }
      queue.unshift(...parts)
      continue
    }

    current = candidate
  }

  if (current.length > 0) groups.push(coalesceTables(current))
  return groups.map(coalesceTables)
}

function breakApart(
  block: HTMLElement,
  limit: number,
  measure: (nodes: HTMLElement[], withRail: boolean) => number,
): HTMLElement[] {
  if (block.matches('.editorial-table')) return splitTable(block)

  if (block.matches(ATOMIC)) return [block]

  if (block.classList.contains('milestone-strip')) {
    const items = [...block.querySelectorAll(':scope > .milestone-strip-list > .milestone-strip-item')]
    if (items.length <= 1) return [block]
    const title = block.querySelector(':scope > .milestone-strip-title')
    return items.map((item, index) => {
      const strip = block.cloneNode(false) as HTMLElement
      if (index === 0 && title) strip.appendChild(title.cloneNode(true))
      const list = block.querySelector(':scope > .milestone-strip-list')
      const ol = (list ? list.cloneNode(false) : document.createElement('ol')) as HTMLElement
      if (!list) ol.className = 'milestone-strip-list'
      ol.appendChild(item.cloneNode(true))
      strip.appendChild(ol)
      return strip
    })
  }

  if (block.matches('ol, ul')) {
    const items = elementChildren(block)
    if (items.length <= 1) return [block]
    return items.map((item) => {
      const list = block.cloneNode(false) as HTMLElement
      list.appendChild(item.cloneNode(true))
      return list
    })
  }

  if (block.matches('p, li, blockquote')) {
    return splitText(block, limit, measure)
  }

  const kids = elementChildren(block)
  if (kids.length > 1) return kids.map((kid) => kid.cloneNode(true) as HTMLElement)
  if (kids.length === 1) return [kids[0].cloneNode(true) as HTMLElement]
  return splitText(block, limit, measure)
}

function splitTable(block: HTMLElement): HTMLElement[] {
  const table = block.querySelector('table')
  const rows = [...block.querySelectorAll('tbody > tr')]
  if (!table || rows.length <= 1) return [block]
  const head = table.querySelector('thead')
  return rows.map((row) => {
    const figure = block.cloneNode(false) as HTMLElement
    const next = table.cloneNode(false) as HTMLTableElement
    if (head) next.appendChild(head.cloneNode(true))
    const body = document.createElement('tbody')
    body.appendChild(row.cloneNode(true))
    next.appendChild(body)
    figure.appendChild(next)
    return figure
  })
}

function coalesceTables(nodes: HTMLElement[]): HTMLElement[] {
  const merged: HTMLElement[] = []
  for (const node of nodes) {
    const prev = merged[merged.length - 1]
    const row = node.matches('.editorial-table') ? node.querySelector('tbody > tr') : null
    const prevBody = prev?.matches('.editorial-table') ? prev.querySelector('tbody') : null
    if (prev && row && prevBody) {
      prevBody.appendChild(row)
      continue
    }
    merged.push(node)
  }
  return merged
}

function splitText(
  el: HTMLElement,
  limit: number,
  measure: (nodes: HTMLElement[], withRail: boolean) => number,
): HTMLElement[] {
  const total = el.textContent?.length ?? 0
  if (total < 80) return [el]

  const parts: HTMLElement[] = []
  let rest: HTMLElement | null = el
  let safety = 0
  while (rest && safety++ < 30) {
    if (measure([rest], false) <= limit + SLOP) {
      parts.push(rest)
      break
    }
    const count = fitCount(rest, limit, measure)
    const snapped = snapWhitespace(rest.textContent ?? '', count)
    if (snapped < 24) {
      parts.push(rest)
      break
    }
    const [head, tail] = divideText(rest, snapped)
    if (!tail.textContent?.trim()) {
      parts.push(head)
      break
    }
    parts.push(head)
    rest = tail
  }
  return parts.length > 0 ? parts : [el]
}

function fitCount(
  el: HTMLElement,
  limit: number,
  measure: (nodes: HTMLElement[], withRail: boolean) => number,
): number {
  const total = el.textContent?.length ?? 0
  let lo = 0
  let hi = total
  let best = 0
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const [head] = divideText(el, mid)
    if (measure([head], false) <= limit + SLOP) {
      best = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return best
}

function divideText(el: HTMLElement, count: number): [HTMLElement, HTMLElement] {
  const head = el.cloneNode(true) as HTMLElement
  const tail = el.cloneNode(true) as HTMLElement
  const headTexts = textNodes(head)
  const tailTexts = textNodes(tail)
  let left = Math.max(0, count)
  for (let i = 0; i < headTexts.length; i++) {
    const data = headTexts[i].data
    if (left >= data.length) {
      tailTexts[i].data = ''
      left -= data.length
    } else if (left > 0) {
      headTexts[i].data = data.slice(0, left)
      tailTexts[i].data = data.slice(left).replace(/^\s+/, '')
      left = 0
    } else {
      headTexts[i].data = ''
    }
  }
  pruneEmpty(head)
  pruneEmpty(tail)
  return [head, tail]
}

function textNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let current = walker.nextNode()
  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }
  return nodes
}

function pruneEmpty(root: HTMLElement) {
  const elements = [...root.querySelectorAll('*')].reverse()
  for (const node of elements) {
    if (node.matches('img, svg, br')) continue
    if (node.querySelector('img, svg')) continue
    if (!node.textContent?.trim()) node.remove()
  }
}

function snapWhitespace(text: string, index: number): number {
  if (index <= 0) return 0
  const slice = text.slice(0, index)
  const space = Math.max(slice.lastIndexOf(' '), slice.lastIndexOf('\n'))
  if (space >= 24) return space
  return index
}

function cloneWhole(sheet: HTMLElement, pageNumber: number): HTMLElement {
  const page = sheet.cloneNode(true) as HTMLElement
  decorate(page, pageNumber, false)
  return page
}

function renderGroup(
  sheet: HTMLElement,
  nodes: HTMLElement[],
  pageNumber: number,
  withRail: boolean,
  withSectionId: boolean,
): HTMLElement {
  const page = sheet.cloneNode(false) as HTMLElement
  page.removeAttribute('id')
  const vozes = sheet.querySelector(':scope > .vozes-page')
  if (vozes) {
    const frame = vozes.cloneNode(false) as HTMLElement
    const main = document.createElement('div')
    main.className = 'vozes-main'
    nodes.forEach((node) => main.appendChild(node))
    frame.appendChild(main)
    if (withRail) {
      const rail = vozes.querySelector(':scope > .vozes-rail')
      if (rail) frame.appendChild(rail.cloneNode(true))
    }
    page.appendChild(frame)
  } else {
    nodes.forEach((node) => page.appendChild(node))
  }
  if (withSectionId && sheet.id) page.id = sheet.id
  decorate(page, pageNumber, true)
  return page
}

/** Page 1 sits on the right. After that, even pages face the next odd page. */
function arrangeSpreads(pages: HTMLElement[]): HTMLElement[] {
  const spreads: HTMLElement[] = []
  const push = (left: HTMLElement | null, right: HTMLElement | null) => {
    const fit = document.createElement('div')
    fit.className = 'spread-fit'
    const scale = document.createElement('div')
    scale.className = 'spread-scale'
    const spread = document.createElement('div')
    spread.className = 'spread'
    spread.append(left ?? spreadPad(), right ?? spreadPad())
    scale.append(spread)
    fit.append(scale)
    spreads.push(fit)
  }
  if (pages.length === 0) return spreads
  push(null, pages[0])
  for (let index = 1; index < pages.length; index += 2) {
    push(pages[index], pages[index + 1] ?? null)
  }
  return spreads
}

function spreadPad(): HTMLElement {
  const pad = document.createElement('div')
  pad.className = 'spread-pad'
  pad.setAttribute('aria-hidden', 'true')
  return pad
}

function decorate(page: HTMLElement, pageNumber: number, stripExistingFolio: boolean) {
  page.classList.add('sheet-page')
  page.dataset.pageSide = pageNumber % 2 === 1 ? 'right' : 'left'
  page.dataset.page = String(pageNumber)
  if (stripExistingFolio) page.querySelectorAll(':scope > .folio').forEach((node) => node.remove())
  if (page.querySelector(':scope > .folio')) return
  if (page.classList.contains('layout-vozes-cover') || page.classList.contains('layout-vozes-blank')) {
    page.dataset.folio = 'off'
    return
  }
  const folio = document.createElement('span')
  folio.className = 'folio'
  folio.textContent = String(pageNumber)
  page.appendChild(folio)
}

function createProbe(sheet: HTMLElement): {
  measure: (nodes: HTMLElement[], withRail: boolean) => number
  destroy: () => void
} {
  const probe = sheet.cloneNode(false) as HTMLElement
  probe.removeAttribute('id')
  probe.style.position = 'absolute'
  probe.style.left = '-12000px'
  probe.style.top = '0'
  probe.style.margin = '0'
  probe.style.minHeight = '0'
  probe.style.height = 'auto'
  probe.style.maxHeight = 'none'
  probe.style.overflow = 'visible'
  probe.style.boxShadow = 'none'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'

  const vozes = sheet.querySelector(':scope > .vozes-page')
  let slot: HTMLElement = probe
  let rail: HTMLElement | null = null
  if (vozes) {
    const frame = vozes.cloneNode(false) as HTMLElement
    const main = document.createElement('div')
    main.className = 'vozes-main'
    frame.appendChild(main)
    const sourceRail = vozes.querySelector(':scope > .vozes-rail')
    if (sourceRail) {
      rail = sourceRail.cloneNode(true) as HTMLElement
      rail.hidden = true
      frame.appendChild(rail)
    }
    probe.appendChild(frame)
    slot = main
  }

  document.body.appendChild(probe)

  return {
    measure(nodes, withRail) {
      const clones = nodes.map((node) => node.cloneNode(true) as HTMLElement)
      if (slot === probe) probe.replaceChildren(...clones)
      else slot.replaceChildren(...clones)
      if (rail) rail.hidden = !withRail
      return probe.scrollHeight
    },
    destroy() {
      probe.remove()
    },
  }
}

function pageLimitPx(): number {
  const ruler = document.createElement('div')
  ruler.style.position = 'absolute'
  ruler.style.visibility = 'hidden'
  ruler.style.height = 'var(--page-height)'
  ruler.style.width = '0'
  document.body.appendChild(ruler)
  const height = ruler.offsetHeight
  ruler.remove()
  return height
}

function elementChildren(parent: Element): HTMLElement[] {
  return [...parent.children].filter((node): node is HTMLElement => node instanceof HTMLElement)
}

function isHeading(node: HTMLElement): boolean {
  return node.matches('h1, h2, h3, h4, .kicker, .band-label')
}

function isSkippable(node: HTMLElement): boolean {
  if (node.matches('img, svg')) return false
  if (node.querySelector('img, svg')) return false
  return !node.textContent?.trim()
}
