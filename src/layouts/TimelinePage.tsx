import { Masthead } from '../components/Masthead'
import { Heading } from '../components/Heading'
import { Paragraph } from '../components/Paragraph'
import { Timeline } from '../components/Timeline'
import type { EditorialDocument, TimelineContent } from '../content/types'

type TimelinePageProps = {
  id: string
  content: TimelineContent
  showMasthead: boolean
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function TimelinePage({ id, content, showMasthead, publication }: TimelinePageProps) {
  return (
    <article
      id={id}
      className="sheet composition layout-timeline"
      data-strategy="structured"
      data-layout="timeline"
    >
      {showMasthead ? <Masthead publication={publication} /> : null}
      <p className="kicker">{content.kicker}</p>
      <Heading level={1}>{content.title}</Heading>
      {content.lede.map((paragraph, index) => (
        <Paragraph key={`${id}-lede-${index}`}>{paragraph}</Paragraph>
      ))}
      <Timeline events={content.events} />
    </article>
  )
}
