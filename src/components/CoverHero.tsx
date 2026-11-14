import type { EditorialDocument } from '../content/types'

type CoverHeroProps = {
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function CoverHero({ publication }: CoverHeroProps) {
  return (
    <header className="cover-hero cover-hero--artwork" aria-label="Capa">
      <img
        className="cover-hero-artwork"
        src="media/capa_lemann_levantamento.png"
        alt={publication.title}
        width={2480}
        height={3508}
        decoding="async"
      />
    </header>
  )
}
