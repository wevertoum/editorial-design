import type { LoadedPublication, LoadedSection } from '../content/loadDocument'
import { InfographicPage } from './InfographicPage'
import { StandardPage } from './StandardPage'
import { TimelinePage } from './TimelinePage'

type SectionViewProps = {
  section: LoadedSection
  publication: LoadedPublication
  showMasthead: boolean
}

export function SectionView({ section, publication, showMasthead }: SectionViewProps) {
  if (section.layout === 'standard') {
    const Content = section.Content
    return (
      <StandardPage
        id={section.id}
        kicker={section.kicker}
        sheetVariant={section.sheetVariant}
        showMasthead={showMasthead}
        publication={publication}
      >
        <Content />
      </StandardPage>
    )
  }

  if (section.layout === 'timeline') {
    return (
      <TimelinePage
        id={section.id}
        content={section.timeline}
        showMasthead={showMasthead}
        publication={publication}
      />
    )
  }

  return (
    <InfographicPage
      id={section.id}
      content={section.infographic}
      showMasthead={showMasthead}
      publication={publication}
    />
  )
}
