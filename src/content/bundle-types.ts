import type {
  CompositionStrategy,
  InfographicContent,
  SectionLayout,
  TimelineContent,
} from './types'

export type TextRun = {
  text: string
  bold?: boolean
  italic?: boolean
}

export type FlowBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string; runs?: TextRun[] }
  | { type: 'paragraph'; runs: TextRun[] }
  | { type: 'table'; headers: string[]; rows: string[][]; caption?: string; variant?: string }
  | { type: 'image'; src: string; alt?: string; caption?: string; credit?: string }
  | { type: 'component'; name: string; props: Record<string, unknown> }

export type FlowSectionPayload = {
  kind: 'flow'
  derivedFrom: 'mdx' | 'inventory'
  kicker?: string
  sheetVariant?: string
  blocks: FlowBlock[]
  /** Present on export when derivedFrom is inventory — MDX AST for diff/debug */
  mdxBlocks?: FlowBlock[]
}

export type StructuredSectionPayload = {
  kind: 'structured'
  timeline: TimelineContent
}

export type ArtDirectedSectionPayload = {
  kind: 'art-directed'
  infographic: InfographicContent
}

export type BundleSectionPayload =
  | FlowSectionPayload
  | StructuredSectionPayload
  | ArtDirectedSectionPayload

export type BundleSection = {
  id: string
  strategy: CompositionStrategy
  layout: SectionLayout
  source: string
  payload: BundleSectionPayload
}

export const PUBLICATION_BUNDLE_VERSION = 1 as const

export type PublicationBundle = {
  bundleVersion: typeof PUBLICATION_BUNDLE_VERSION
  generatedAt: string
  id: string
  language: string
  title: string
  subtitle: string
  author: string
  mapeamento?: {
    inventory: string
  }
  sections: BundleSection[]
}

export type LoadedBundleSection =
  | {
      id: string
      strategy: 'flow'
      layout: 'standard'
      source: string
      kicker?: string
      sheetVariant?: string
      blocks: FlowBlock[]
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

export type LoadedBundlePublication = Omit<PublicationBundle, 'sections' | 'bundleVersion' | 'generatedAt' | 'mapeamento'> & {
  sections: LoadedBundleSection[]
}
