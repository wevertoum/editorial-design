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
        width={2551}
        height={3579}
        decoding="async"
      />
    </header>
  )
}
