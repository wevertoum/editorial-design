import type { FlowBlock, FlowSectionPayload, TextRun } from './bundle-types'

const COUNTRY_HEADINGS: Record<string, { slug: string; label: string }> = {
  'AUSTRÁLIA.': { slug: 'australia', label: 'Austrália' },
  'ESTADOS UNIDOS.': { slug: 'usa', label: 'Estados Unidos' },
  'INGLATERRA.': { slug: 'england', label: 'Inglaterra' },
  'NIGÉRIA.': { slug: 'nigeria', label: 'Nigéria' },
  'CHILE.': { slug: 'chile', label: 'Chile' },
}

const FRONT_SECTION_LABELS = new Set(['APRESENTAÇÃO', 'RESUMO EXECUTIVO', 'ORGANIZAÇÕES'])

const YEAR_RE = /^(\d{4}(?:\s+a\s+\d{4})?|\d{4}\s*[-–]\s*\d{4})$/

type InventoryItem = {
  text?: string
  style?: string
  images?: { file?: string }[]
}

type InvBlock =
  | { kind: 'paragraph'; plain: string; style: string | null }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'image'; imageTarget: string }

type FlowSegment = {
  kind: 'flow' | 'cross'
  slug: string
  kicker: string
  blocks: InvBlock[]
}

export type InventoryDocument = {
  blocks: InventoryItem[]
}

function looksLikeYear(text: string): boolean {
  return YEAR_RE.test(text.trim())
}

function isCountryHeading(text: string): boolean {
  return text.trim() in COUNTRY_HEADINGS
}

function paragraphBlock(text: string, style: string | null | undefined): InvBlock {
  return { kind: 'paragraph', plain: text, style: style ?? null }
}

function inventoryItemsToBlocks(items: InventoryItem[]): InvBlock[] {
  const blocks: InvBlock[] = []
  for (const item of items) {
    const text = (item.text ?? '').trim()
    if (text) {
      blocks.push(paragraphBlock(text, item.style))
    }
    for (const img of item.images ?? []) {
      const fname = img.file
      if (fname) {
        blocks.push({ kind: 'image', imageTarget: fname })
      }
    }
  }
  return blocks
}

function plainAt(blocks: InvBlock[], index: number): string | null {
  if (index >= blocks.length || blocks[index].kind !== 'paragraph') return null
  return blocks[index].plain.trim()
}

function eatActorsTable(blocks: InvBlock[], start: number): { table: InvBlock; next: number } {
  const header = [plainAt(blocks, start) ?? '', plainAt(blocks, start + 1) ?? '']
  let i = start + 2
  const rows: string[][] = [header]
  while (i + 2 < blocks.length) {
    if (blocks[i].kind !== 'paragraph') break
    const a = plainAt(blocks, i)
    const b = plainAt(blocks, i + 1)
    const c = plainAt(blocks, i + 2)
    if (!a || !b || !c) break
    if (isCountryHeading(a) || looksLikeYear(a) || a === 'Ano') break
    if (/^\d+\.\d+\./.test(a)) break
    rows.push([`${a}${b}`, c])
    i += 3
  }
  return { table: { kind: 'table', rows }, next: i }
}

function eatCrossTable(blocks: InvBlock[], start: number): { table: InvBlock; next: number } {
  const rows: string[][] = [['Ano', 'Currículo', 'Organização']]
  let i = start + 3
  while (i < blocks.length) {
    if (blocks[i].kind !== 'paragraph') break
    const year = plainAt(blocks, i)
    if (year === null) break
    if (isCountryHeading(year)) break
    if (!looksLikeYear(year)) break
    if (i + 2 >= blocks.length) break
    const cur = plainAt(blocks, i + 1) ?? ''
    const org = plainAt(blocks, i + 2) ?? ''
    rows.push([year, cur, org])
    i += 3
    while (i < blocks.length && blocks[i].kind === 'paragraph') {
      const cont = plainAt(blocks, i) ?? ''
      if (isCountryHeading(cont) || looksLikeYear(cont)) break
      if (/^\d+\.\s/.test(cont) && !cont.includes('Onde as trajetórias')) break
      rows.push(['', cont, ''])
      i += 1
    }
  }
  return { table: { kind: 'table', rows }, next: i }
}

function eatAnoMarcoTable(
  blocks: InvBlock[],
  start: number,
  headerLabel: string,
): { table: InvBlock; next: number } {
  const rows: string[][] = [['Ano', headerLabel]]
  let i = start + 2
  while (i + 1 < blocks.length) {
    if (blocks[i].kind !== 'paragraph') break
    const year = plainAt(blocks, i)
    if (year === null) break
    if (isCountryHeading(year)) break
    if (!looksLikeYear(year)) break
    const marco = plainAt(blocks, i + 1) ?? ''
    rows.push([year, marco])
    i += 2
  }
  return { table: { kind: 'table', rows }, next: i }
}

function eatKsTable(blocks: InvBlock[], start: number): { table: InvBlock; next: number } {
  const header = ['Etapas']
  for (let j = 1; j < 5; j++) {
    header.push(plainAt(blocks, start + j) ?? '')
  }
  let i = start + 5
  const rows: string[][] = [header]
  while (i < blocks.length && blocks[i].kind === 'paragraph') {
    const label = plainAt(blocks, i) ?? ''
    if (isCountryHeading(label)) break
    if (label === 'Ator' || label === 'Ano' || label === 'Canais de participação' || /^\d+\.\d+\./.test(label)) {
      break
    }
    if (i + 4 >= blocks.length) break
    const cells = [label]
    let j = i + 1
    for (let _ = 0; _ < 4; _++) {
      let val = plainAt(blocks, j) ?? ''
      if (j + 1 < blocks.length && (plainAt(blocks, j + 1) ?? '') === 'anos') {
        val = `${val}anos`
        j += 2
      } else {
        j += 1
      }
      cells.push(val)
    }
    if (cells.length === 5) {
      rows.push(cells)
    }
    i = j
    if (label === 'Anos escolares') break
  }
  return { table: { kind: 'table', rows }, next: i }
}

function eatChileLevelsTable(blocks: InvBlock[], start: number): { table: InvBlock; next: number } {
  const pairs: string[] = []
  for (const off of [0, 2, 4]) {
    const a = plainAt(blocks, start + off) ?? ''
    const b = plainAt(blocks, start + off + 1) ?? ''
    pairs.push(`${a}${b}`)
  }
  return { table: { kind: 'table', rows: [pairs] }, next: start + 6 }
}

export function coalesceInventoryTables(blocks: InvBlock[]): InvBlock[] {
  const out: InvBlock[] = []
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]
    if (block.kind !== 'paragraph') {
      out.push(block)
      i += 1
      continue
    }

    const text = block.plain.trim()
    const n1 = plainAt(blocks, i + 1)
    const n2 = plainAt(blocks, i + 2)

    if (text === 'Ator' && n1 && n1.includes('Papel')) {
      const { table, next } = eatActorsTable(blocks, i)
      out.push(table)
      i = next
      continue
    }

    if (text === 'Ano' && n1 === 'Currículo' && n2 === 'Organização') {
      const { table, next } = eatCrossTable(blocks, i)
      out.push(table)
      i = next
      continue
    }

    if (text === 'Ano' && (n1 === 'Marco' || n1 === 'Marco da organização')) {
      const { table, next } = eatAnoMarcoTable(blocks, i, n1)
      out.push(table)
      i = next
      continue
    }

    if (text === 'Etapas' && n1?.startsWith('KS ')) {
      const { table, next } = eatKsTable(blocks, i)
      out.push(table)
      i = next
      continue
    }

    if (text === 'Educación Parvularia' && n2 === 'Educación Básica') {
      const { table, next } = eatChileLevelsTable(blocks, i)
      out.push(table)
      i = next
      continue
    }

    out.push(block)
    i += 1
  }
  return out
}

function isCrossTable(rows: string[][]): boolean {
  if (!rows.length) return false
  const header = rows[0].join(' | ').toLowerCase()
  return header.includes('currículo') && header.includes('organização')
}

function isActorsTable(rows: string[][]): boolean {
  if (!rows.length) return false
  const header = rows[0].join(' | ').toLowerCase()
  return header.includes('ator') && header.includes('papel')
}

function isOrgTrajectoryTable(rows: string[][]): boolean {
  if (!rows.length) return false
  const header = rows[0].join(' | ').toLowerCase()
  return header.startsWith('ano') && header.includes('marco')
}

function isChileEducationLevelsTable(rows: string[][]): boolean {
  if (rows.length !== 1 || rows[0].length < 3) return false
  const joined = rows[0].join(' ').toLowerCase()
  return joined.includes('educación parvularia') && joined.includes('educación básica')
}

function headingLevel(text: string, style: string | null): 2 | 3 | null {
  const plain = text.trim()

  if (FRONT_SECTION_LABELS.has(plain)) return 2
  if (isCountryHeading(plain)) return 2

  if (style === 'Heading1') {
    if (/^\d+\.\s/.test(plain) && !/^\d+\.\d+\./.test(plain) && plain.length <= 200) {
      return 3
    }
    if (plain === plain.toUpperCase() && plain.length <= 96) return 2
    return null
  }

  if (/^\d+\.\s/.test(plain) && !/^\d+\.\d+\./.test(plain)) return 2
  if (/^\d+\.\d+\./.test(plain)) return 3
  return null
}

function padRow(row: string[], colCount: number): string[] {
  const cells = [...row]
  while (cells.length < colCount) cells.push('')
  return cells.slice(0, colCount)
}

function invTableToFlowBlock(rows: string[][]): FlowBlock {
  if (!rows.length) {
    return { type: 'table', headers: [''], rows: [] }
  }
  const colCount = Math.max(...rows.map((r) => r.length))
  const padded = rows.map((r) => padRow(r, colCount))

  if (padded.length === 1 && padded[0].length === 1) {
    return { type: 'paragraph', runs: [{ text: padded[0][0] }] }
  }
  if (padded.every((r) => r.length === 1)) {
    return { type: 'paragraph', runs: [{ text: padded.map((r) => r[0]).filter(Boolean).join('\n') }] }
  }

  let caption = ''
  let variant: string | undefined = 'vozes'
  const headers = padRow(padded[0], colCount)
  const body = padded.slice(1).map((r) => padRow(r, colCount))

  if (isChileEducationLevelsTable(padded)) {
    caption = ''
    variant = 'vozes'
  } else if (isActorsTable(padded)) {
    caption = headers[0] || 'Tabela'
  } else if (isOrgTrajectoryTable(padded)) {
    caption = 'Marcos da organização'
  } else if (headers[0]?.toLowerCase().startsWith('ano')) {
    caption = ''
  } else {
    variant = undefined
  }

  return { type: 'table', headers, rows: body, caption: caption || undefined, variant }
}

function paragraphToFlowBlocks(block: InvBlock & { kind: 'paragraph' }): FlowBlock[] {
  const level = headingLevel(block.plain, block.style)
  const plain = block.plain.trim()
  const runs: TextRun[] = [{ text: plain }]

  if (level) {
    return [{ type: 'heading', level, text: plain, runs }]
  }

  if (plain.toLowerCase().startsWith('fonte:')) {
    let body = plain.slice(6).trim()
    if (body.startsWith(':')) body = body.slice(1).trim()
    return [{ type: 'component', name: 'SourceNote', props: { children: body } }]
  }

  return [{ type: 'paragraph', runs }]
}

function invBlockToFlowBlocks(block: InvBlock, imageMap: Map<string, string>): FlowBlock[] {
  if (block.kind === 'paragraph') {
    return paragraphToFlowBlocks(block)
  }
  if (block.kind === 'table') {
    return [invTableToFlowBlock(block.rows)]
  }
  const media = imageMap.get(block.imageTarget) ?? `org-${block.imageTarget}`
  const alt = `Ilustração do documento (${media}).`
  return [{ type: 'image', src: `media/${media}`, alt }]
}

export function buildInventoryImageMap(items: InventoryItem[]): Map<string, string> {
  const map = new Map<string, string>()
  const seen = new Set<string>()
  for (const item of items) {
    for (const img of item.images ?? []) {
      const fname = img.file
      if (!fname || seen.has(fname)) continue
      seen.add(fname)
      map.set(fname, `org-${fname}`)
    }
  }
  return map
}

export function segmentInventoryFlow(blocks: InvBlock[]): FlowSegment[] {
  const segments: FlowSegment[] = []
  let current: FlowSegment | null = null
  let currentCountry: string | null = null
  let currentCountryLabel: string | null = null
  const countryFlowParts: Record<string, number> = {}
  let mode: 'front' | 'body' = 'front'
  const startSegment = (slug: string, kicker: string): FlowSegment => ({
    kind: 'flow',
    slug,
    kicker,
    blocks: [],
  })

  for (const block of blocks) {
    if (block.kind === 'paragraph') {
      const plain = block.plain.trim()
      if (plain === 'ORGANIZAÇÕES') {
        mode = 'body'
        continue
      }
      if (isCountryHeading(plain)) {
        const { slug, label } = COUNTRY_HEADINGS[plain]
        currentCountry = slug
        currentCountryLabel = label
        countryFlowParts[slug] = 1
        current = startSegment(slug, label)
        segments.push(current)
        continue
      }
      if (mode === 'front') {
        if (
          plain === 'Levantamento Internacional' ||
          plain === 'de Instituições de Apoio a Padrões Curriculares' ||
          plain === '2026'
        ) {
          continue
        }
        if (plain === 'APRESENTAÇÃO' || plain === 'RESUMO EXECUTIVO') {
          const slug = plain === 'APRESENTAÇÃO' ? 'apresentacao' : 'resumo-executivo'
          const kicker = plain === 'APRESENTAÇÃO' ? 'Apresentação' : 'Resumo executivo'
          current = startSegment(slug, kicker)
          segments.push(current)
          current.blocks.push(block)
          continue
        }
        if (current?.kind === 'flow' && (current.slug === 'apresentacao' || current.slug === 'resumo-executivo')) {
          current.blocks.push(block)
          continue
        }
      }
      if (!current) continue
      if (/^[234]\.\s/.test(plain) && plain.includes('Onde as trajetórias se cruzam')) {
        current.blocks.push(block)
        continue
      }
      if (/^2\.\s/.test(plain) && current.kind === 'flow') {
        current.blocks.push(block)
        continue
      }
      if (/^4\.\s/.test(plain) && plain.toUpperCase().includes('BRITISH CURRICULUM FORUM')) {
        current.blocks.push(block)
        continue
      }
      current.blocks.push(block)
    } else if (block.kind === 'table') {
      if (isCrossTable(block.rows)) {
        if (currentCountry && currentCountryLabel) {
          const n = (countryFlowParts[currentCountry] ?? 1) + 1
          countryFlowParts[currentCountry] = n
          const slug = n > 1 ? `${currentCountry}-${n}` : currentCountry
          current = startSegment(slug, currentCountryLabel)
          segments.push(current)
        } else {
          current = null
        }
      } else if (current) {
        current.blocks.push(block)
      }
    } else if (block.kind === 'image') {
      if (current) current.blocks.push(block)
    }
  }

  return segments.filter((s) => s.kind === 'flow')
}

export function inventoryDocumentToFlowMap(
  data: InventoryDocument,
): Map<string, { kicker: string; blocks: FlowBlock[] }> {
  const coalesced = coalesceInventoryTables(inventoryItemsToBlocks(data.blocks ?? []))
  const imageMap = buildInventoryImageMap(data.blocks ?? [])
  const segments = segmentInventoryFlow(coalesced)
  const map = new Map<string, { kicker: string; blocks: FlowBlock[] }>()
  for (const seg of segments) {
    const blocks = seg.blocks.flatMap((b) => invBlockToFlowBlocks(b, imageMap))
    map.set(seg.slug, { kicker: seg.kicker, blocks })
  }
  return map
}

export type FlowSectionFromInventoryOptions = {
  kicker?: string
  sheetVariant?: string
  mdxBlocks?: FlowBlock[]
}

export function flowSectionFromInventory(
  sectionId: string,
  flowMap: Map<string, { kicker: string; blocks: FlowBlock[] }>,
  options: FlowSectionFromInventoryOptions = {},
): FlowSectionPayload | undefined {
  const entry = flowMap.get(sectionId)
  if (!entry) return undefined
  return {
    kind: 'flow',
    derivedFrom: 'inventory',
    kicker: options.kicker ?? entry.kicker,
    sheetVariant: options.sheetVariant,
    blocks: entry.blocks,
    ...(options.mdxBlocks !== undefined ? { mdxBlocks: options.mdxBlocks } : {}),
  }
}
