import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { BundleSection, PublicationBundle } from '../src/content/bundle-types'
import { PUBLICATION_BUNDLE_VERSION } from '../src/content/bundle-types'
import {
  flowSectionFromInventory,
  inventoryDocumentToFlowMap,
  type InventoryDocument as InvDoc,
} from '../src/content/inventory-to-blocks'
import { mergeMdxLinkRuns } from '../src/content/inline-markdown'
import { mdxFileToFlowPayload } from '../src/content/mdx-to-blocks'
import { parseDocument, parseInfographic, parseTimeline } from '../src/content/schema'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const manifestPath = path.join(contentDir, 'document.json')
const inventoryPath = path.join(contentDir, 'mapeamento', 'inventory.json')
const listPairsPath = path.join(contentDir, 'mapeamento', 'list-pairs.json')
const outPath = path.join(contentDir, 'publication.bundle.json')

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8')) as unknown
}

const manifest = readJson(manifestPath)
const document = parseDocument(manifest)

const mapeamento = existsSync(inventoryPath)
  ? { inventory: path.posix.join('mapeamento/inventory.json') }
  : undefined

function loadListPairKeys(): Set<string> {
  if (!existsSync(listPairsPath)) return new Set()
  const raw = readJson(listPairsPath) as [string, string][]
  return new Set(raw.map(([title, body]) => `${title}\0${body}`))
}

const inventoryFlowMap = mapeamento
  ? inventoryDocumentToFlowMap(readJson(inventoryPath) as InvDoc, {
      listPairKeys: loadListPairKeys(),
    })
  : undefined

const sections: BundleSection[] = document.sections.map((section) => {
  const absolute = path.join(contentDir, section.source)
  if (!existsSync(absolute)) {
    throw new Error(`Missing content file: content/${section.source}`)
  }

  if (section.strategy === 'flow') {
    const raw = readFileSync(absolute, 'utf8')
    const mdxPayload = mdxFileToFlowPayload(section.source, raw)
    if (inventoryFlowMap) {
      const fromInventory = flowSectionFromInventory(section.id, inventoryFlowMap, {
        kicker: mdxPayload.kicker,
        sheetVariant: mdxPayload.sheetVariant,
        mdxBlocks: mdxPayload.blocks,
      })
      if (fromInventory) {
        const blocks = mergeMdxLinkRuns(fromInventory.blocks, mdxPayload.blocks)
        return {
          ...section,
          payload: { ...fromInventory, blocks, mdxBlocks: mdxPayload.blocks },
        }
      }
    }
    return { ...section, payload: mdxPayload }
  }

  const json = readJson(absolute)
  if (section.strategy === 'structured') {
    return {
      ...section,
      payload: {
        kind: 'structured',
        timeline: parseTimeline(json, section.source),
      },
    }
  }

  return {
    ...section,
    payload: {
      kind: 'art-directed',
      infographic: parseInfographic(json, section.source),
    },
  }
})

const bundle: PublicationBundle = {
  bundleVersion: PUBLICATION_BUNDLE_VERSION,
  generatedAt: new Date().toISOString(),
  id: document.id,
  language: document.language,
  title: document.title,
  subtitle: document.subtitle,
  author: document.author,
  mapeamento,
  sections,
}

const text = `${JSON.stringify(bundle, null, 2)}\n`
writeFileSync(outPath, text, 'utf8')

const bytes = statSync(outPath).size
console.log(`Wrote ${path.relative(root, outPath)}`)
console.log(`${sections.length} sections · ${bytes.toLocaleString('en-US')} bytes`)

if (inventoryFlowMap) {
  let inventoryFlow = 0
  const blockDiffs: string[] = []
  for (const section of sections) {
    if (section.strategy !== 'flow' || section.payload.kind !== 'flow') continue
    if (section.payload.derivedFrom === 'inventory') {
      inventoryFlow += 1
      const mdxCount = section.payload.mdxBlocks?.length
      if (mdxCount !== undefined && mdxCount !== section.payload.blocks.length) {
        blockDiffs.push(
          `${section.id}: inventory ${section.payload.blocks.length} · mdx ${mdxCount}`,
        )
      }
    }
  }
  console.log(`${inventoryFlow} flow section(s) derived from inventory`)
  if (blockDiffs.length > 0) {
    console.log('Block count diffs (inventory vs mdxBlocks):')
    for (const line of blockDiffs) console.log(`  ${line}`)
  }
}
