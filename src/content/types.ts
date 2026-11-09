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

export type TimelineContent = {
  kicker: string
  title: string
  lede: string[]
  events: TimelineEvent[]
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
