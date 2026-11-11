import { MDXProvider } from '@mdx-js/react'
import type { LoadedPublication } from '../content/loadDocument'
import { resolveProfile } from '../engine/profile'
import { paginationEngine } from '../engine/pagination'
import { mdxComponents } from '../mdx-components'
import { SectionView } from './SectionView'

const profileCopy = {
  screen:
    'Edição rápida (sem paginação): npm run dev:edit · spreads e numeração: npm run dev · PDF: npm run build',
  digital: 'Digital profile · A4 trim · no bleed',
  print:
    'Print layout profile · A4 trim · bleed and crop marks are added in the PDF · color is not converted',
} as const

export function DocumentShell({ publication }: { publication: LoadedPublication }) {
  const profile = resolveProfile(import.meta.env.MODE)

  return (
    <MDXProvider components={mdxComponents}>
      <p className="preview-banner">{profileCopy[profile]}</p>
      <div className="desk" data-profile={profile} data-pagination-engine={paginationEngine.id}>
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
