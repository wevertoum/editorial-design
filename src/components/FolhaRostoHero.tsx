import type { EditorialDocument } from '../content/types'

type FolhaRostoHeroProps = {
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function FolhaRostoHero({ publication }: FolhaRostoHeroProps) {
  return (
    <header className="folha-rosto-hero folha-rosto-hero--artwork" aria-label="Folha de rosto">
      <img
        className="folha-rosto-artwork"
        src="media/folha_rosto_levantamento.png"
        alt={publication.title}
        width={2480}
        height={3508}
        decoding="async"
      />
    </header>
  )
}
