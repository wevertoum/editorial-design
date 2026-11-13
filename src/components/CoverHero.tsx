import type { EditorialDocument } from '../content/types'
import { CoverGrafismoRail } from './CoverGrafismoRail'

type CoverHeroProps = {
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function CoverHero({ publication }: CoverHeroProps) {
  return (
    <header className="cover-hero cover-hero--grafismo" aria-label="Capa">
      <CoverGrafismoRail />

      <div className="cover-hero-main">
        <p className="cover-hero-edition">
          <span className="cover-hero-edition-year">{publication.subtitle}</span>
          <span className="cover-hero-edition-dash" aria-hidden="true">
            {' '}
            —
          </span>
        </p>

        <h1 className="cover-hero-title">{publication.title}</h1>

        <footer className="cover-hero-foot" aria-label="Realização">
          <img
            className="cover-hero-logo cover-hero-logo--vozes"
            src="media/logo_vozes_educacao.svg"
            alt="Vozes da Educação"
            width={690}
            height={281}
            decoding="async"
          />
          <span className="cover-hero-foot-rule" aria-hidden="true" />
          <img
            className="cover-hero-logo cover-hero-logo--lemann"
            src="media/logo_fundacao_lemann.svg"
            alt="Fundação Lemann"
            width={980}
            height={480}
            decoding="async"
          />
        </footer>
      </div>
    </header>
  )
}
