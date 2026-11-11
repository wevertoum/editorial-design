import type { LoadedBundlePublication, LoadedBundleSection } from './bundle-types'
import { parsePublicationBundle } from './schema'

export type { LoadedBundlePublication, LoadedBundleSection }

export function loadPublicationFromBundle(value: unknown): LoadedBundlePublication {
  const bundle = parsePublicationBundle(value)
  const sections: LoadedBundleSection[] = bundle.sections.map((section): LoadedBundleSection => {
    if (section.payload.kind === 'flow') {
      return {
        id: section.id,
        strategy: 'flow',
        layout: 'standard',
        source: section.source,
        kicker: section.payload.kicker,
        sheetVariant: section.payload.sheetVariant,
        blocks: section.payload.blocks,
      }
    }
    if (section.payload.kind === 'structured') {
      return {
        id: section.id,
        strategy: 'structured',
        layout: 'timeline',
        source: section.source,
        timeline: section.payload.timeline,
      }
    }
    return {
      id: section.id,
      strategy: 'art-directed',
      layout: 'infographic',
      source: section.source,
      infographic: section.payload.infographic,
    }
  })

  const { bundleVersion: _v, generatedAt: _g, mapeamento: _m, sections: _s, ...meta } = bundle
  return { ...meta, sections }
}

export function loadPublicationFromBundleFile(raw: unknown): LoadedBundlePublication {
  return loadPublicationFromBundle(raw)
}
