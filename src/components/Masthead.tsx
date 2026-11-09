import type { EditorialDocument } from '../content/types'

type MastheadProps = {
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
}

export function Masthead({ publication }: MastheadProps) {
  return (
    <header className="masthead">
      <p className="masthead-title">{publication.title}</p>
      <p className="masthead-subtitle">{publication.subtitle}</p>
      <p className="masthead-author">{publication.author}</p>
    </header>
  )
}
