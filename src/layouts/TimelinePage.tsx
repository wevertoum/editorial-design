import { Masthead } from '../components/Masthead'
import { Heading } from '../components/Heading'
import { Paragraph } from '../components/Paragraph'
import { Timeline } from '../components/Timeline'
import { DualTrackTimeline } from '../components/vozes/DualTrackTimeline'
import { SourceNote } from '../components/vozes/SourceNote'
import type { EditorialDocument, TimelineContent } from '../content/types'

type TimelinePageProps = {
  id: string
  content: TimelineContent
  showMasthead: boolean
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function TimelinePage({ id, content, showMasthead, publication }: TimelinePageProps) {
  const isDual = content.variant === 'dual-track'

  return (
    <article
      id={id}
      className={`sheet composition layout-timeline${isDual ? ' layout-timeline-dual' : ''}`}
      data-strategy="structured"
      data-layout="timeline"
    >
      {showMasthead ? <Masthead publication={publication} /> : null}
      <p className="kicker">{content.kicker}</p>
      {isDual && content.spreadPart === 'b' ? null : <Heading level={1}>{content.title}</Heading>}
      {content.lede.length > 0
        ? content.lede.map((paragraph, index) => (
            <Paragraph key={`${id}-lede-${index}`} className={isDual ? 'dual-track-lede' : undefined}>
              {paragraph}
            </Paragraph>
          ))
        : null}
      {isDual && content.spreadPart === 'b' && content.introBodyRight ? (
        <Paragraph className="dual-track-lede dual-track-lede-right">{content.introBodyRight}</Paragraph>
      ) : null}
      {isDual ? (
        <DualTrackTimeline nodes={content.nodes} spreadPart={content.spreadPart} />
      ) : (
        <Timeline events={content.events} />
      )}
      {isDual && content.sourceNote ? <SourceNote>{content.sourceNote}</SourceNote> : null}
    </article>
  )
}
