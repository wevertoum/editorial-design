import type { ComponentType } from 'react'
import rawDocument from '../../content/document.json'
import { ContentError, parseDocument, parseInfographic, parseTimeline } from './schema'
import type { EditorialDocument, InfographicContent, TimelineContent } from './types'

type MdxModule = {
  default: ComponentType
  frontmatter?: unknown
}

export type LoadedSection =
  | {
      id: string
      strategy: 'flow'
      layout: 'standard'
      source: string
      kicker?: string
      sheetVariant?: string
      Content: ComponentType
    }
  | {
      id: string
      strategy: 'structured'
      layout: 'timeline'
      source: string
      timeline: TimelineContent
    }
  | {
      id: string
      strategy: 'art-directed'
      layout: 'infographic'
      source: string
      infographic: InfographicContent
    }

export type LoadedPublication = Omit<EditorialDocument, 'sections'> & {
  sections: LoadedSection[]
}

const mdxModules = import.meta.glob('../../content/chapters/*.mdx', { eager: true })
const timelineModules = import.meta.glob('../../content/timelines/*.json', {
  eager: true,
  import: 'default',
})
const infographicModules = import.meta.glob('../../content/infographics/*.json', {
  eager: true,
  import: 'default',
})

function findModule(modules: Record<string, unknown>, source: string): unknown {
  const match = Object.entries(modules).find(([key]) => key.replaceAll('\\', '/').endsWith(`/${source}`))
  if (!match) {
    throw new ContentError(
      `No loaded module matches content/${source}. The file must sit in the folder that matches its strategy.`,
    )
  }
  return match[1]
}

function readFrontmatter(frontmatter: unknown, source: string): { kicker?: string; sheetVariant?: string } {
  if (frontmatter === undefined) return {}
  if (typeof frontmatter !== 'object' || frontmatter === null || Array.isArray(frontmatter)) {
    throw new ContentError(`${source} frontmatter must be an object`)
  }
  const record = frontmatter as Record<string, unknown>
  let kicker: string | undefined
  if (record.kicker !== undefined) {
    if (typeof record.kicker !== 'string' || record.kicker.trim() === '') {
      throw new ContentError(`${source} frontmatter.kicker must be a non-empty string`)
    }
    kicker = record.kicker.trim()
  }
  let sheetVariant: string | undefined
  if (record.sheetVariant !== undefined) {
    if (typeof record.sheetVariant !== 'string' || record.sheetVariant.trim() === '') {
      throw new ContentError(`${source} frontmatter.sheetVariant must be a non-empty string`)
    }
    sheetVariant = record.sheetVariant.trim()
  }
  return { kicker, sheetVariant }
}

function readMdx(source: string): { Content: ComponentType; kicker?: string; sheetVariant?: string } {
  const loaded = findModule(mdxModules, source)
  if (
    typeof loaded !== 'object' ||
    loaded === null ||
    !('default' in loaded) ||
    typeof loaded.default !== 'function'
  ) {
    throw new ContentError(`${source} did not export an MDX component`)
  }
  const mdx = loaded as MdxModule
  return {
    Content: mdx.default,
    ...readFrontmatter(mdx.frontmatter, source),
  }
}

export function loadPublication(): LoadedPublication {
  const document = parseDocument(rawDocument)
  const sections = document.sections.map((section): LoadedSection => {
    if (section.strategy === 'flow') {
      const mdx = readMdx(section.source)
      return { ...section, strategy: 'flow', layout: 'standard', ...mdx }
    }
    if (section.strategy === 'structured') {
      return {
        ...section,
        strategy: 'structured',
        layout: 'timeline',
        timeline: parseTimeline(findModule(timelineModules, section.source), section.source),
      }
    }
    return {
      ...section,
      strategy: 'art-directed',
      layout: 'infographic',
      infographic: parseInfographic(findModule(infographicModules, section.source), section.source),
    }
  })

  return { ...document, sections }
}
