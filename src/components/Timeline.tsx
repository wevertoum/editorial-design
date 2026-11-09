import type { TimelineEvent } from '../content/types'
import { Heading } from './Heading'
import { Paragraph } from './Paragraph'

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id} id={event.id} className="timeline-event">
          <p className="timeline-date">{event.dateLabel}</p>
          <div className="timeline-copy">
            <Heading level={2}>{event.title}</Heading>
            {event.paragraphs.map((paragraph, index) => (
              <Paragraph key={`${event.id}-${index}`}>{paragraph}</Paragraph>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}
