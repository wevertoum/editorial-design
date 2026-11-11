import type {
  BundleSection,
  FlowBlock,
  FlowSectionPayload,
  PublicationBundle,
  TextRun,
} from './bundle-types'
import { PUBLICATION_BUNDLE_VERSION } from './bundle-types'
import type {
  CompositionStrategy,
  EditorialDocument,
  InfographicContent,
  InfographicStat,
  InfographicStep,
  SectionLayout,
  TimelineContent,
  TimelineEvent,
} from './types'

const layoutForStrategy: Record<CompositionStrategy, SectionLayout> = {
  flow: 'standard',
  structured: 'timeline',
  'art-directed': 'infographic',
}

const sourcePrefix: Record<CompositionStrategy, string> = {
  flow: 'chapters/',
  structured: 'timelines/',
  'art-directed': 'infographics/',
}

const sourceExtension: Record<CompositionStrategy, string> = {
  flow: '.mdx',
  structured: '.json',
  'art-directed': '.json',
}

const strategies = new Set<CompositionStrategy>(['flow', 'structured', 'art-directed'])
const idPattern = /^[a-z][a-z0-9-]*$/

export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ContentError(`${label} must be a non-empty string`)
  }
  return value.trim()
}

function requireParagraphs(value: unknown, label: string): string[] {
  if (typeof value === 'string') {
    const paragraphs = value
      .split(/\n\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
    if (paragraphs.length === 0) {
      throw new ContentError(`${label} must contain text`)
    }
    return paragraphs
  }

  if (!Array.isArray(value) || value.length === 0) {
    throw new ContentError(`${label} must be a non-empty string or an array of strings`)
  }

  return value.map((paragraph, index) => requireString(paragraph, `${label}[${index}]`))
}

function requireId(value: unknown, label: string, seen: Set<string>): string {
  const id = requireString(value, label)
  if (!idPattern.test(id)) {
    throw new ContentError(`${label} must be a lowercase slug (letters, numbers, hyphens)`)
  }
  if (seen.has(id)) {
    throw new ContentError(`${label} duplicates "${id}"`)
  }
  seen.add(id)
  return id
}

export function parseDocument(value: unknown): EditorialDocument {
  if (!isRecord(value)) {
    throw new ContentError('document must be an object')
  }

  const id = requireId(value.id, 'id', new Set())
  const language = requireString(value.language, 'language')
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
    throw new ContentError('language must be a BCP 47 tag such as "en"')
  }

  if (!Array.isArray(value.sections) || value.sections.length === 0) {
    throw new ContentError('sections must be a non-empty array')
  }

  const seenIds = new Set<string>()
  const seenSources = new Set<string>()
  const sections = value.sections.map((section, index) => {
    const label = `sections[${index}]`
    if (!isRecord(section)) {
      throw new ContentError(`${label} must be an object`)
    }

    const strategy = section.strategy
    if (typeof strategy !== 'string' || !strategies.has(strategy as CompositionStrategy)) {
      throw new ContentError(`${label}.strategy must be flow, structured, or art-directed`)
    }
    const typedStrategy = strategy as CompositionStrategy
    const layout = requireString(section.layout, `${label}.layout`)
    const expectedLayout = layoutForStrategy[typedStrategy]
    if (layout !== expectedLayout) {
      throw new ContentError(
        `${label}.layout "${layout}" does not match strategy "${typedStrategy}" (expected "${expectedLayout}")`,
      )
    }

    const source = requireString(section.source, `${label}.source`)
    if (source.includes('..') || source.startsWith('/') || source.includes('\\')) {
      throw new ContentError(`${label}.source must be a relative path inside content/`)
    }
    if (!source.startsWith(sourcePrefix[typedStrategy]) || !source.endsWith(sourceExtension[typedStrategy])) {
      throw new ContentError(
        `${label}.source must look like ${sourcePrefix[typedStrategy]}name${sourceExtension[typedStrategy]}`,
      )
    }
    if (!/^[^/]+\/[a-z0-9-]+\.(mdx|json)$/.test(source)) {
      throw new ContentError(`${label}.source must be one file name, not a nested path`)
    }
    if (seenSources.has(source)) {
      throw new ContentError(`${label}.source duplicates "${source}"`)
    }
    seenSources.add(source)

    return {
      id: requireId(section.id, `${label}.id`, seenIds),
      strategy: typedStrategy,
      layout: layout as SectionLayout,
      source,
    }
  })

  return {
    id,
    language,
    title: requireString(value.title, 'title'),
    subtitle: requireString(value.subtitle, 'subtitle'),
    author: requireString(value.author, 'author'),
    sections,
  }
}

export function parseTimeline(value: unknown, source: string): TimelineContent {
  if (!isRecord(value)) {
    throw new ContentError(`${source} must be an object`)
  }

  const kicker = requireString(value.kicker, `${source} kicker`)
  const title = requireString(value.title, `${source} title`)

  if (value.variant === 'dual-track') {
    const lede =
      value.lede === undefined
        ? []
        : Array.isArray(value.lede) && value.lede.length === 0
          ? []
          : requireParagraphs(value.lede, `${source} lede`)
    if (!Array.isArray(value.nodes) || value.nodes.length === 0) {
      throw new ContentError(`${source} nodes must be a non-empty array for dual-track timelines`)
    }
    const spreadPart = value.spreadPart
    if (spreadPart !== 'a' && spreadPart !== 'b') {
      throw new ContentError(`${source} spreadPart must be "a" or "b"`)
    }
  if (typeof value.spreadIndex !== 'number' || value.spreadIndex < 1) {
      throw new ContentError(`${source} spreadIndex must be a positive number`)
    }
    const seen = new Set<string>()
    const nodes = value.nodes.map((node, index) => {
      const label = `${source} nodes[${index}]`
      if (!isRecord(node)) {
        throw new ContentError(`${label} must be an object`)
      }
      return {
        id: requireId(node.id, `${label}.id`, seen),
        year: requireString(node.year, `${label}.year`),
        curriculo: requireString(node.curriculo, `${label}.curriculo`),
        organizacao: requireString(node.organizacao, `${label}.organizacao`),
      }
    })
    const introBodyRight =
      value.introBodyRight === undefined
        ? undefined
        : requireString(value.introBodyRight, `${source} introBodyRight`)
    const sourceNote =
      value.sourceNote === undefined ? undefined : requireString(value.sourceNote, `${source} sourceNote`)
    return {
      variant: 'dual-track',
      kicker,
      title,
      lede,
      spreadPart,
      spreadIndex: value.spreadIndex,
      introBodyRight,
      sourceNote,
      nodes,
    }
  }

  const lede = requireParagraphs(value.lede, `${source} lede`)

  if (!Array.isArray(value.events) || value.events.length === 0) {
    throw new ContentError(`${source} events must be a non-empty array`)
  }

  const seen = new Set<string>()
  const events: TimelineEvent[] = value.events.map((event, index) => {
    const label = `${source} events[${index}]`
    if (!isRecord(event)) {
      throw new ContentError(`${label} must be an object`)
    }
    return {
      id: requireId(event.id, `${label}.id`, seen),
      dateLabel: requireString(event.dateLabel, `${label}.dateLabel`),
      title: requireString(event.title, `${label}.title`),
      paragraphs: requireParagraphs(event.body, `${label}.body`),
    }
  })

  return {
    kicker,
    title,
    lede,
    events,
  }
}

export function parseInfographic(value: unknown, source: string): InfographicContent {
  if (!isRecord(value)) {
    throw new ContentError(`${source} must be an object`)
  }
  if (!Array.isArray(value.stats) || value.stats.length === 0) {
    throw new ContentError(`${source} stats must be a non-empty array`)
  }
  if (!Array.isArray(value.steps) || value.steps.length === 0) {
    throw new ContentError(`${source} steps must be a non-empty array`)
  }

  const statIds = new Set<string>()
  const stats: InfographicStat[] = value.stats.map((stat, index) => {
    const label = `${source} stats[${index}]`
    if (!isRecord(stat)) {
      throw new ContentError(`${label} must be an object`)
    }
    const note = stat.note === undefined ? undefined : requireString(stat.note, `${label}.note`)
    return {
      id: requireId(stat.id, `${label}.id`, statIds),
      value: requireString(stat.value, `${label}.value`),
      label: requireString(stat.label, `${label}.label`),
      note,
    }
  })

  const stepIds = new Set<string>()
  const steps: InfographicStep[] = value.steps.map((step, index) => {
    const label = `${source} steps[${index}]`
    if (!isRecord(step)) {
      throw new ContentError(`${label} must be an object`)
    }
    return {
      id: requireId(step.id, `${label}.id`, stepIds),
      index: requireString(step.index, `${label}.index`),
      title: requireString(step.title, `${label}.title`),
      body: requireString(step.body, `${label}.body`),
    }
  })

  return {
    kicker: requireString(value.kicker, `${source} kicker`),
    title: requireString(value.title, `${source} title`),
    lede: requireString(value.lede, `${source} lede`),
    stats,
    steps,
    footnote: requireString(value.footnote, `${source} footnote`),
  }
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string') {
    throw new ContentError(`${label} must be a string`)
  }
  return value
}

function requireTextRuns(value: unknown, label: string): TextRun[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ContentError(`${label} must be a non-empty array of runs`)
  }
  return value.map((run, index) => {
    const itemLabel = `${label}[${index}]`
    if (!isRecord(run)) {
      throw new ContentError(`${itemLabel} must be an object`)
    }
    const text = requireString(run.text, `${itemLabel}.text`)
    const bold = run.bold === undefined ? undefined : Boolean(run.bold)
    const italic = run.italic === undefined ? undefined : Boolean(run.italic)
    return { text, bold, italic }
  })
}

function parseFlowBlock(value: unknown, label: string): FlowBlock {
  if (!isRecord(value) || typeof value.type !== 'string') {
    throw new ContentError(`${label} must be a flow block with type`)
  }
  switch (value.type) {
    case 'heading': {
      const level = value.level
      if (typeof level !== 'number' || level < 1 || level > 6) {
        throw new ContentError(`${label}.level must be between 1 and 6`)
      }
      const text = requireString(value.text, `${label}.text`)
      const runs =
        value.runs === undefined ? undefined : requireTextRuns(value.runs, `${label}.runs`)
      return { type: 'heading', level: level as 1 | 2 | 3 | 4 | 5 | 6, text, runs }
    }
    case 'paragraph':
      return { type: 'paragraph', runs: requireTextRuns(value.runs, `${label}.runs`) }
    case 'table': {
      if (!Array.isArray(value.headers) || value.headers.length === 0) {
        throw new ContentError(`${label}.headers must be a non-empty array`)
      }
      if (!Array.isArray(value.rows)) {
        throw new ContentError(`${label}.rows must be an array`)
      }
      const headers = value.headers.map((h, i) => requireString(h, `${label}.headers[${i}]`))
      const rows = value.rows.map((row, ri) => {
        if (!Array.isArray(row)) {
          throw new ContentError(`${label}.rows[${ri}] must be an array`)
        }
        return row.map((cell, ci) => requireString(cell, `${label}.rows[${ri}][${ci}]`))
      })
      const caption = optionalString(value.caption, `${label}.caption`)
      const variant = optionalString(value.variant, `${label}.variant`)
      return { type: 'table', headers, rows, caption, variant }
    }
    case 'image': {
      const src = requireString(value.src, `${label}.src`)
      const alt = optionalString(value.alt, `${label}.alt`)
      const caption = optionalString(value.caption, `${label}.caption`)
      const credit = optionalString(value.credit, `${label}.credit`)
      return { type: 'image', src, alt, caption, credit }
    }
    case 'component': {
      const name = requireString(value.name, `${label}.name`)
      if (!isRecord(value.props)) {
        throw new ContentError(`${label}.props must be an object`)
      }
      return { type: 'component', name, props: value.props }
    }
    default:
      throw new ContentError(`${label}.type "${String(value.type)}" is not supported`)
  }
}

function parseFlowSectionPayload(value: unknown, label: string): FlowSectionPayload {
  if (!isRecord(value) || value.kind !== 'flow') {
    throw new ContentError(`${label} must be a flow payload`)
  }
  const derivedFrom = value.derivedFrom
  if (derivedFrom !== 'mdx' && derivedFrom !== 'inventory') {
    throw new ContentError(`${label}.derivedFrom must be mdx or inventory`)
  }
  if (!Array.isArray(value.blocks)) {
    throw new ContentError(`${label}.blocks must be an array`)
  }
  const kicker = value.kicker === undefined ? undefined : requireString(value.kicker, `${label}.kicker`)
  const sheetVariant =
    value.sheetVariant === undefined ? undefined : requireString(value.sheetVariant, `${label}.sheetVariant`)
  const blocks = value.blocks.map((block, index) => parseFlowBlock(block, `${label}.blocks[${index}]`))
  const mdxBlocks =
    value.mdxBlocks === undefined
      ? undefined
      : (value.mdxBlocks as unknown[]).map((block, index) =>
          parseFlowBlock(block, `${label}.mdxBlocks[${index}]`),
        )
  return { kind: 'flow', derivedFrom, kicker, sheetVariant, blocks, mdxBlocks }
}

function parseBundleSectionPayload(
  value: unknown,
  label: string,
  strategy: CompositionStrategy,
  source: string,
) {
  if (!isRecord(value) || typeof value.kind !== 'string') {
    throw new ContentError(`${label} must include kind`)
  }
  if (strategy === 'flow') {
    return parseFlowSectionPayload(value, label)
  }
  if (strategy === 'structured') {
    if (value.kind !== 'structured' || !isRecord(value.timeline)) {
      throw new ContentError(`${label} must be a structured payload with timeline`)
    }
    return { kind: 'structured' as const, timeline: parseTimeline(value.timeline, source) }
  }
  if (value.kind !== 'art-directed' || !isRecord(value.infographic)) {
    throw new ContentError(`${label} must be an art-directed payload with infographic`)
  }
  return { kind: 'art-directed' as const, infographic: parseInfographic(value.infographic, source) }
}

export function parsePublicationBundle(value: unknown): PublicationBundle {
  if (!isRecord(value)) {
    throw new ContentError('publication bundle must be an object')
  }
  if (value.bundleVersion !== PUBLICATION_BUNDLE_VERSION) {
    throw new ContentError(`bundleVersion must be ${PUBLICATION_BUNDLE_VERSION}`)
  }
  const generatedAt = requireString(value.generatedAt, 'generatedAt')
  const id = requireId(value.id, 'id', new Set())
  const language = requireString(value.language, 'language')
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
    throw new ContentError('language must be a BCP 47 tag such as "en"')
  }

  if (!Array.isArray(value.sections) || value.sections.length === 0) {
    throw new ContentError('sections must be a non-empty array')
  }

  const seenIds = new Set<string>()
  const sections: BundleSection[] = value.sections.map((section, index) => {
    const label = `sections[${index}]`
    if (!isRecord(section)) {
      throw new ContentError(`${label} must be an object`)
    }
    const id = requireId(section.id, `${label}.id`, seenIds)
    const strategy = section.strategy
    if (typeof strategy !== 'string' || !strategies.has(strategy as CompositionStrategy)) {
      throw new ContentError(`${label}.strategy must be flow, structured, or art-directed`)
    }
    const typedStrategy = strategy as CompositionStrategy
    const layout = requireString(section.layout, `${label}.layout`)
    const expectedLayout = layoutForStrategy[typedStrategy]
    if (layout !== expectedLayout) {
      throw new ContentError(
        `${label}.layout "${layout}" does not match strategy "${typedStrategy}" (expected "${expectedLayout}")`,
      )
    }
    const source = requireString(section.source, `${label}.source`)
    const payload = parseBundleSectionPayload(section.payload, `${label}.payload`, typedStrategy, source)
    return { id, strategy: typedStrategy, layout: layout as SectionLayout, source, payload }
  })

  let mapeamento: PublicationBundle['mapeamento']
  if (value.mapeamento !== undefined) {
    if (!isRecord(value.mapeamento)) {
      throw new ContentError('mapeamento must be an object')
    }
    mapeamento = { inventory: requireString(value.mapeamento.inventory, 'mapeamento.inventory') }
  }

  return {
    bundleVersion: PUBLICATION_BUNDLE_VERSION,
    generatedAt,
    id,
    language,
    title: requireString(value.title, 'title'),
    subtitle: requireString(value.subtitle, 'subtitle'),
    author: requireString(value.author, 'author'),
    sections,
    mapeamento,
  }
}

export function assertBundleMatchesDocument(bundle: PublicationBundle, document: EditorialDocument): void {
  if (bundle.id !== document.id) {
    throw new ContentError('bundle id does not match document.json')
  }
  if (bundle.language !== document.language) {
    throw new ContentError('bundle language does not match document.json')
  }
  if (bundle.title !== document.title || bundle.subtitle !== document.subtitle || bundle.author !== document.author) {
    throw new ContentError('bundle metadata does not match document.json')
  }
  if (bundle.sections.length !== document.sections.length) {
    throw new ContentError('bundle section count does not match document.json')
  }
  for (let i = 0; i < document.sections.length; i++) {
    const manifest = document.sections[i]
    const section = bundle.sections[i]
    if (
      manifest.id !== section.id ||
      manifest.strategy !== section.strategy ||
      manifest.layout !== section.layout ||
      manifest.source !== section.source
    ) {
      throw new ContentError(
        `bundle sections[${i}] does not match document.json (expected ${manifest.id}, got ${section.id})`,
      )
    }
    if (bundle.mapeamento?.inventory && manifest.strategy === 'flow') {
      if (section.payload.kind !== 'flow') {
        throw new ContentError(`bundle sections[${i}] expected flow payload`)
      }
      if (section.payload.derivedFrom !== 'inventory') {
        throw new ContentError(
          `bundle sections[${i}] (${section.id}) must use derivedFrom "inventory" when mapeamento.inventory is set`,
        )
      }
      if (section.payload.blocks.length === 0) {
        const mdxCount = section.payload.mdxBlocks?.length ?? 0
        if (mdxCount > 0) {
          throw new ContentError(
            `bundle sections[${i}] (${section.id}) has no inventory blocks but mdxBlocks has ${mdxCount}`,
          )
        }
      }
    }
  }
}
