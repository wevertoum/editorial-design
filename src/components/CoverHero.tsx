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
        <div className="cover-hero-kicker-row">
          <p className="cover-hero-kicker">Relatório</p>
          <span className="cover-hero-kicker-rule" aria-hidden="true" />
        </div>

        <div className="cover-hero-title-wrap">
          <h1 className="cover-hero-title">{publication.title}</h1>
        </div>

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
