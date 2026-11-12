import { MDXProvider } from '@mdx-js/react'
import { useLayoutEffect, useRef } from 'react'
import type { LoadedPublication } from '../content/loadDocument'
import { resolveProfile } from '../engine/profile'
import { paginationEngine } from '../engine/pagination'
import { paginateInto } from '../lib/paginateDesk'
import { mdxComponents } from '../mdx-components'
import { SectionView } from './SectionView'

const profileCopy = {
  screen: 'Prévia em páginas A4, lado a lado. O que não cabe continua na página seguinte.',
  digital: 'Perfil digital · A4 · sem sangria',
  print: 'Perfil de impressão · página A4 com sangria · a cor não é convertida',
} as const

export function DocumentShell({ publication }: { publication: LoadedPublication }) {
  const profile = resolveProfile(import.meta.env.MODE)
  const deskRef = useRef<HTMLDivElement>(null)
  const sourceRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const desk = deskRef.current
    const source = sourceRef.current
    if (!desk || !source) return
    return paginateInto(source, desk)
  }, [publication])

  return (
    <MDXProvider components={mdxComponents}>
      <p className="preview-banner">{profileCopy[profile]}</p>
      <div ref={deskRef} className="desk" data-profile={profile} data-pagination-engine={paginationEngine.id} />
      <div ref={sourceRef} className="paginate-source" aria-hidden="true">
        {publication.sections.map((section) => (
          <SectionView
            key={section.id}
            section={section}
            publication={publication}
            showMasthead={section.id === 'capa'}
          />
        ))}
      </div>
    </MDXProvider>
  )
}
