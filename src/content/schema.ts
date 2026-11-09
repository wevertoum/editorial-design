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
    kicker: requireString(value.kicker, `${source} kicker`),
    title: requireString(value.title, `${source} title`),
    lede: requireParagraphs(value.lede, `${source} lede`),
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
