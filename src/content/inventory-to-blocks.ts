import type { FlowBlock, FlowSectionPayload, TextRun } from './bundle-types'
import { parseInlineRuns } from './inline-markdown'

const COUNTRY_HEADINGS: Record<string, { slug: string; label: string; code: string }> = {
  'AUSTRÁLIA.': { slug: 'australia', label: 'Austrália', code: 'AU' },
  'ESTADOS UNIDOS.': { slug: 'usa', label: 'Estados Unidos', code: 'US' },
  'INGLATERRA.': { slug: 'england', label: 'Inglaterra', code: 'GB' },
  'NIGÉRIA.': { slug: 'nigeria', label: 'Nigéria', code: 'NG' },
  'CHILE.': { slug: 'chile', label: 'Chile', code: 'CL' },
}

const COUNTRY_OPENING_BY_SLUG: Record<string, { code: string; title: string }> = Object.fromEntries(
  Object.values(COUNTRY_HEADINGS).map((entry) => [entry.slug, { code: entry.code, title: entry.label }]),
)

const FRONT_SECTION_LABELS = new Set(['APRESENTAÇÃO', 'RESUMO EXECUTIVO', 'ORGANIZAÇÕES'])

const SUBSECTION_LABELS = new Set(['Canais de participação'])

const SHOUTING_TITLES: Record<string, string> = {
  'A ACHIEVE': 'Achieve',
  'A CURRICULUM ORGANIZATION OF NIGERIA': 'Curriculum Organization of Nigeria',
  'O BRITISH CURRICULUM FORUM (BCF)': 'British Curriculum Forum (BCF)',
}

const KNOWN_PROFILES: Record<string, { role: string; label: string }> = {
  'Anna Ritzema': { role: 'Executive Director, ACSA', label: 'Perfil' },
  'Michael Cohen': { role: 'President, Achieve', label: 'Perfil' },
  'Victoria Pendry': { role: 'CEO, Curriculum Foundation', label: 'Perfil' },
  'Grace Healy': { role: 'President, British Curriculum Forum', label: 'Perfil' },
  'Aisha Isa': { role: 'Presidenta Nacional, CON', label: 'Perfil' },
  'Alfredo Grez Kaulen': { role: 'Presidente do diretório, Fundación Reimagina', label: 'Perfil' },
}

const YEAR_RE = /^(\d{4}(?:\s+a\s+\d{4})?|\d{4}\s*[-–]\s*\d{4})$/

const ROLE_DESCRIPTION_RE =
  /^(Autoridade|Analisa|Apoiam|Conduz|Define|Definem|Desenvolve|Estabelece|Formula|Inspeciona|Organizam|Planejam|Realizam|Reúne|Traduzem|Transformam)\b/

function isRoleDescription(text: string): boolean {
  const t = text.trim()
  return Boolean(t) && ROLE_DESCRIPTION_RE.test(t)
}

function joinLabelSubtitle(label: string, subtitle: string): string {
  return `${label.trim()}\n${subtitle.trim()}`
}

type InventoryItem = {
  text?: string
  style?: string
  images?: { file?: string }[]
  credit?: string | null
}

type InvBlock =
  | { kind: 'paragraph'; plain: string; style: string | null }
  | { kind: 'list'; title: string; body: string }
  | { kind: 'table'; rows: string[][] }
  | { kind: 'image'; imageTarget: string; credit?: string }
  | { kind: 'profile'; name: string; role: string; label: string; bio: string; imageTarget: string }

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

function coalesceListPairs(blocks: InvBlock[], listPairKeys: Set<string>): InvBlock[] {
  if (listPairKeys.size === 0) return blocks
  const out: InvBlock[] = []
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]
    if (block.kind !== 'paragraph') {
      out.push(block)
      i += 1
      continue
    }
    const maybeNext = blocks[i + 1]
    if (maybeNext?.kind === 'paragraph') {
      const next = maybeNext
      const key = `${block.plain}\0${next.plain}`
      if (listPairKeys.has(key) && headingLevel(next.plain, next.style) === null) {
        out.push({ kind: 'list', title: block.plain, body: next.plain })
        i += 2
        continue
      }
    }
    const singleKey = `${block.plain}\0`
    if (listPairKeys.has(singleKey)) {
      out.push({ kind: 'list', title: block.plain, body: '' })
      i += 1
      continue
    }
    out.push(block)
    i += 1
  }
  return out
}

function inventoryItemsToBlocks(items: InventoryItem[]): InvBlock[] {
  const blocks: InvBlock[] = []
  for (const item of items) {
    const text = (item.text ?? '').trim()
    if (text) {
      blocks.push(paragraphBlock(text, item.style))
    }
    const credit = (item.credit ?? '').trim() || undefined
    for (const img of item.images ?? []) {
      const fname = img.file
      if (fname) {
        blocks.push({ kind: 'image', imageTarget: fname, credit })
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
  while (i < blocks.length) {
    if (blocks[i].kind !== 'paragraph') break
    const a = plainAt(blocks, i)
    if (!a) break
    if (isCountryHeading(a) || looksLikeYear(a) || a === 'Ano') break
    if (/^\d+\.\d+\./.test(a)) break
    const b = plainAt(blocks, i + 1)
    if (!b) break
    const c = plainAt(blocks, i + 2)
    if (isRoleDescription(b)) {
      rows.push([a, b])
      i += 2
      continue
    }
    if (c && isRoleDescription(c)) {
      rows.push([joinLabelSubtitle(a, b), c])
      i += 3
      continue
    }
    break
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
    pairs.push(joinLabelSubtitle(a, b))
  }
  return { table: { kind: 'table', rows: [pairs] }, next: start + 6 }
}

function listBlockToDetailList(block: InvBlock & { kind: 'list' }): FlowBlock {
  const title = block.title.replace(/\*\*/g, '').trim()
  const body = block.body.trim()
  const inner = body ? `**${title}**\n\n${body}` : `**${title}**`
  return { type: 'component', name: 'DetailList', props: { children: inner } }
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

function isCrossHeading(text: string): boolean {
  return text.includes('Onde as trajetórias se cruzam')
}

function collapseSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function displayHeadingText(text: string, style: string | null): string {
  let plain = collapseSpaces(text)
  const keepNumberedFinding =
    style === 'Heading1' && /^\d+\.\s/.test(plain) && !/^\d+\.\d+\./.test(plain)
  if (!keepNumberedFinding) {
    plain = plain.replace(/^\d+\.\d+\.\s*/, '').replace(/^\d+\.\s*/, '').trim()
  }
  if (plain.toLowerCase() === 'trajetória da organização') {
    plain = 'A trajetória da organização'
  }
  return SHOUTING_TITLES[plain] ?? plain
}

function headingLevel(text: string, style: string | null): 2 | 3 | null {
  const plain = collapseSpaces(text)

  if (FRONT_SECTION_LABELS.has(plain)) return 2
  if (isCountryHeading(plain)) return 2
  if (SUBSECTION_LABELS.has(plain)) return 3
  if (isCrossHeading(plain)) return null

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

/** Infográficos horizontais que ocupam prosa + rail (ex.: tríade do Australian Curriculum). */
const FULL_WIDTH_IMAGE_FILES = new Set(['image13.png'])

function coalesceImageFonteLines(blocks: InvBlock[]): InvBlock[] {
  const out: InvBlock[] = []
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]
    if (block.kind === 'image') {
      out.push(block)
      const next = blocks[i + 1]
      if (next?.kind === 'paragraph' && next.plain.trim().toLowerCase().startsWith('fonte:')) {
        i += 2
        continue
      }
      i += 1
      continue
    }
    out.push(block)
    i += 1
  }
  return out
}

function coalesceProfiles(blocks: InvBlock[]): InvBlock[] {
  const out: InvBlock[] = []
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]
    const next = blocks[i + 1]
    const after = blocks[i + 2]

    if (block.kind === 'image' && next?.kind === 'paragraph' && next.plain in KNOWN_PROFILES) {
      const meta = KNOWN_PROFILES[next.plain]
      const bio = after?.kind === 'paragraph' && headingLevel(after.plain, after.style) === null ? after.plain : ''
      out.push({
        kind: 'profile',
        name: next.plain,
        role: meta.role,
        label: meta.label,
        bio,
        imageTarget: block.imageTarget,
      })
      i += bio ? 3 : 2
      continue
    }

    if (block.kind === 'paragraph' && block.plain in KNOWN_PROFILES) {
      const meta = KNOWN_PROFILES[block.plain]
      if (next?.kind === 'image') {
        const bio = after?.kind === 'paragraph' && headingLevel(after.plain, after.style) === null ? after.plain : ''
        out.push({
          kind: 'profile',
          name: block.plain,
          role: meta.role,
          label: meta.label,
          bio,
          imageTarget: next.imageTarget,
        })
        i += bio ? 3 : 2
        continue
      }
    }

    out.push(block)
    i += 1
  }
  return out
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
    return {
      type: 'component',
      name: 'MilestoneStrip',
      props: {
        title: 'Marcos da organização',
        items: body.map((row) => [row[0] ?? '', row[1] ?? '']),
      },
    }
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

  if (level) {
    const text = displayHeadingText(plain, block.style)
    return [{ type: 'heading', level, text, runs: parseInlineRuns(text) }]
  }

  const runs: TextRun[] = parseInlineRuns(plain)

  if (plain.toLowerCase().startsWith('fonte:')) {
    let body = plain.slice(6).trim()
    if (body.startsWith(':')) body = body.slice(1).trim()
    return [{ type: 'component', name: 'SourceNote', props: { children: body } }]
  }

  return [{ type: 'paragraph', runs }]
}

function profileToFlowBlock(block: InvBlock & { kind: 'profile' }, imageMap: Map<string, string>): FlowBlock {
  const media = imageMap.get(block.imageTarget) ?? `org-${block.imageTarget}`
  return {
    type: 'component',
    name: 'ProfileCard',
    props: {
      name: block.name,
      role: block.role,
      bio: block.bio,
      photo: `media/${media}`,
    },
  }
}

function countryOpeningBlock(slug: string): FlowBlock | undefined {
  const opening = COUNTRY_OPENING_BY_SLUG[slug]
  if (!opening) return undefined
  return {
    type: 'component',
    name: 'CountryOpening',
    props: { code: opening.code, title: opening.title },
  }
}

function invBlockToFlowBlocks(block: InvBlock, imageMap: Map<string, string>): FlowBlock[] {
  if (block.kind === 'list') {
    return [listBlockToDetailList(block)]
  }
  if (block.kind === 'paragraph') {
    return paragraphToFlowBlocks(block)
  }
  if (block.kind === 'table') {
    return [invTableToFlowBlock(block.rows)]
  }
  if (block.kind === 'profile') {
    return [profileToFlowBlock(block, imageMap)]
  }
  const media = imageMap.get(block.imageTarget) ?? `org-${block.imageTarget}`
  const alt = `Ilustração do documento (${media}).`
  const placement = FULL_WIDTH_IMAGE_FILES.has(block.imageTarget) ? 'span' : undefined
  const caption = block.credit?.trim() || undefined
  return [{ type: 'image', src: `media/${media}`, alt, caption, placement }]
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
    if (block.kind === 'list' || block.kind === 'profile') {
      if (!current) continue
      current.blocks.push(block)
      continue
    }
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
      if (isCrossHeading(plain)) {
        continue
      }
      if (/^2\.\s/.test(plain) && currentCountry && current.slug === currentCountry) {
        countryFlowParts[currentCountry] = Math.max(countryFlowParts[currentCountry] ?? 1, 1)
        current = startSegment(`${currentCountry}-org`, currentCountryLabel ?? current.kicker)
        segments.push(current)
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

  return segments.filter((s) => s.kind === 'flow' && s.blocks.length > 0)
}

export type InventoryToFlowMapOptions = {
  listPairKeys?: Set<string>
}

export function inventoryDocumentToFlowMap(
  data: InventoryDocument,
  options: InventoryToFlowMapOptions = {},
): Map<string, { kicker?: string; blocks: FlowBlock[] }> {
  const listPairKeys = options.listPairKeys ?? new Set<string>()
  const coalesced = coalesceInventoryTables(inventoryItemsToBlocks(data.blocks ?? []))
  const withLists = coalesceListPairs(coalesced, listPairKeys)
  const withProfiles = coalesceProfiles(withLists)
  const withImageFonte = coalesceImageFonteLines(withProfiles)
  const imageMap = buildInventoryImageMap(data.blocks ?? [])
  const segments = segmentInventoryFlow(withImageFonte)
  const map = new Map<string, { kicker?: string; blocks: FlowBlock[] }>()
  for (const seg of segments) {
    const opening = countryOpeningBlock(seg.slug)
    const blocks = [
      ...(opening ? [opening] : []),
      ...seg.blocks.flatMap((b) => invBlockToFlowBlocks(b, imageMap)),
    ]
    map.set(seg.slug, {
      kicker: COUNTRY_OPENING_BY_SLUG[seg.slug] ? undefined : seg.kicker,
      blocks,
    })
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
  flowMap: Map<string, { kicker?: string; blocks: FlowBlock[] }>,
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
