import type { ReactNode } from 'react'
import { CoverHero } from '../components/CoverHero'
import { FolhaRostoHero } from '../components/FolhaRostoHero'
import { Masthead } from '../components/Masthead'
import type { EditorialDocument } from '../content/types'
import { sectionHasDevelopmentLabel } from '../lib/developmentLabelSections'

type StandardPageProps = {
  id: string
  kicker?: string
  sheetVariant?: string
  showMasthead: boolean
  publication: Pick<EditorialDocument, 'title' | 'subtitle' | 'author'>
  children: ReactNode
}

export function StandardPage({ id, kicker, sheetVariant, showMasthead, publication, children }: StandardPageProps) {
  const isCover = sheetVariant === 'vozes-cover'
  const isBlank = sheetVariant === 'vozes-blank'
  const isRoxa = sheetVariant === 'vozes-roxa'
  const isFolhaRosto = sheetVariant === 'vozes-folha-rosto'
  const isChromeless = isCover || isBlank || isFolhaRosto || isRoxa
  const variantClass = sheetVariant ? ` layout-${sheetVariant}` : ''
  const developmentLabel = sectionHasDevelopmentLabel(id)
  return (
    <article
      id={id}
      className={`sheet composition layout-standard${variantClass}`}
      data-strategy="flow"
      data-layout="standard"
      {...(developmentLabel ? { 'data-development-label': '' } : {})}
    >
      {isCover && showMasthead ? <CoverHero publication={publication} /> : null}
      {isFolhaRosto ? <FolhaRostoHero publication={publication} /> : null}
      {!isChromeless && showMasthead ? <Masthead publication={publication} /> : null}
      {!isChromeless && kicker ? <p className="kicker">{kicker}</p> : null}
      {!isChromeless ? children : null}
    </article>
  )
}
