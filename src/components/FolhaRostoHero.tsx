import type { EditorialDocument } from '../content/types'

type FolhaRostoHeroProps = {
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function FolhaRostoHero({ publication }: FolhaRostoHeroProps) {
  return (
    <header className="folha-rosto-hero" aria-label="Folha de rosto">
      <p className="folha-rosto-label">Vozes da Educação</p>
      <h1 className="folha-rosto-title">{publication.title}</h1>
      <p className="folha-rosto-year">{publication.subtitle}</p>
      <p className="folha-rosto-author">{publication.author}</p>
      <p className="folha-rosto-placeholder">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </header>
  )
}
