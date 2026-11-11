import type { ReactNode } from 'react'
import { Masthead } from '../components/Masthead'
import type { EditorialDocument } from '../content/types'

type StandardPageProps = {
  id: string
  kicker?: string
  sheetVariant?: string
  showMasthead: boolean
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
  children: ReactNode
}

export function StandardPage({ id, kicker, sheetVariant, showMasthead, publication, children }: StandardPageProps) {
  const variantClass = sheetVariant ? ` layout-${sheetVariant}` : ''
  return (
    <article
      id={id}
      className={`sheet composition layout-standard${variantClass}`}
      data-strategy="flow"
      data-layout="standard"
    >
      {showMasthead ? <Masthead publication={publication} /> : null}
      {kicker ? <p className="kicker">{kicker}</p> : null}
      {children}
    </article>
  )
}
