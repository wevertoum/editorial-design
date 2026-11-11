import type { EditorialDocument } from '../content/types'

type CoverHeroProps = {
  publication: Pick<EditorialDocument, 'title' | 'subtitle'>
}

export function CoverHero({ publication }: CoverHeroProps) {
  return (
    <header className="cover-hero" aria-label="Capa">
      <img
        className="cover-hero-logo"
        src="media/logo_vozes_educacao.svg"
        alt="Vozes da Educação"
        width={690}
        height={281}
        decoding="async"
      />
      <div className="cover-hero-text">
        <h1 className="cover-hero-title">{publication.title}</h1>
        <p className="cover-hero-year">{publication.subtitle}</p>
      </div>
    </header>
  )
}
