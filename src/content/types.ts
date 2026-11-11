export type CompositionStrategy = 'flow' | 'structured' | 'art-directed'

export type SectionLayout = 'standard' | 'timeline' | 'infographic'

export type DocumentSection = {
  id: string
  strategy: CompositionStrategy
  layout: SectionLayout
  source: string
}

export type EditorialDocument = {
  id: string
  language: string
  title: string
  subtitle: string
  author: string
  sections: DocumentSection[]
}

export type TimelineEvent = {
  id: string
  dateLabel: string
  title: string
  paragraphs: string[]
}

export type DualTrackNode = {
  id: string
  year: string
  curriculo: string
  organizacao: string
  /** Síntese do período — peso tipográfico maior que currículo/organização. */
  resumo?: string
}

export type TimelineContent =
  | {
      variant?: 'classic'
      kicker: string
      title: string
      lede: string[]
      events: TimelineEvent[]
    }
  | {
      variant: 'dual-track'
      kicker: string
      title: string
      lede: string[]
      spreadPart: 'a' | 'b'
      spreadIndex: number
      introBodyRight?: string
      sourceNote?: string
      nodes: DualTrackNode[]
    }

export type InfographicStat = {
  id: string
  value: string
  label: string
  note?: string
}

export type InfographicStep = {
  id: string
  index: string
  title: string
  body: string
}

export type InfographicContent = {
  kicker: string
  title: string
  lede: string
  stats: InfographicStat[]
  steps: InfographicStep[]
  footnote: string
}
