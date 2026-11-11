import bundleRaw from '../content/publication.bundle.json'
import { loadPublicationFromBundle } from './content/loadPublicationFromBundle'
import { renderFlowBlocks } from './content/renderBlocks'
import { StandardPage } from './layouts/StandardPage'

type BundleProofProps = {
  sectionId: string
}

export function BundleProof({ sectionId }: BundleProofProps) {
  const publication = loadPublicationFromBundle(bundleRaw)
  const section = publication.sections.find((s) => s.id === sectionId && s.strategy === 'flow')

  if (!section || section.strategy !== 'flow') {
    return (
      <div className="document">
        <p>
          Bundle proof: no flow section <code>{sectionId}</code>. Try ?section=apresentacao
        </p>
      </div>
    )
  }

  return (
    <div className="document bundle-proof" data-bundle-proof="1">
      <StandardPage
        id={section.id}
        kicker={section.kicker}
        sheetVariant={section.sheetVariant}
        showMasthead
        publication={publication}
      >
        {renderFlowBlocks(section.blocks, section.id)}
      </StandardPage>
      <details className="bundle-proof-meta">
        <summary>Bundle proof metadata</summary>
        <p>
          Section <code>{section.id}</code> · {section.blocks.length} block(s) from{' '}
          <code>publication.bundle.json</code>
        </p>
      </details>
    </div>
  )
}
