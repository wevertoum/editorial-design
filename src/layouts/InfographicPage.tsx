import { Masthead } from '../components/Masthead'
import { Heading } from '../components/Heading'
import { Paragraph } from '../components/Paragraph'
import type { EditorialDocument, InfographicContent } from '../content/types'

type InfographicPageProps = {
  id: string
  content: InfographicContent
  showMasthead: boolean
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function InfographicPage({ id, content, showMasthead, publication }: InfographicPageProps) {
  return (
    <article
      id={id}
      className="sheet composition layout-infographic"
      data-strategy="art-directed"
      data-layout="infographic"
    >
      {showMasthead ? <Masthead publication={publication} /> : null}
      <div className="infographic">
        <header className="infographic-mast">
          <p className="kicker">{content.kicker}</p>
          <Heading level={1}>{content.title}</Heading>
          <Paragraph>{content.lede}</Paragraph>
        </header>
        <div className="infographic-stats">
          {content.stats.map((stat) => (
            <section key={stat.id} className="infographic-stat" aria-labelledby={`${stat.id}-label`}>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label" id={`${stat.id}-label`}>
                {stat.label}
              </p>
              {stat.note ? <p className="stat-note">{stat.note}</p> : null}
            </section>
          ))}
        </div>
        <ol className="infographic-steps">
          {content.steps.map((step) => (
            <li key={step.id} className="infographic-step">
              <p className="step-index">{step.index}</p>
              <Heading level={2}>{step.title}</Heading>
              <Paragraph>{step.body}</Paragraph>
            </li>
          ))}
        </ol>
        <footer className="infographic-footnote">
          <Paragraph>{content.footnote}</Paragraph>
        </footer>
      </div>
    </article>
  )
}
