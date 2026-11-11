import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { FlowBlock } from '../src/content/bundle-types'
import {
  flowSectionFromInventory,
  inventoryDocumentToFlowMap,
  type InventoryDocument,
} from '../src/content/inventory-to-blocks'
import { mdxFileToFlowPayload } from '../src/content/mdx-to-blocks'
import { parseDocument } from '../src/content/schema'

function tableSignature(blocks: FlowBlock[]): string[] {
  return blocks
    .filter((b): b is Extract<FlowBlock, { type: 'table' }> => b.type === 'table')
    .map(
      (t) =>
        `${t.caption ?? ''}|${t.headers.length}x${t.rows.length}|${t.headers.join(';').slice(0, 60)}`,
    )
}

const root = process.cwd()
const contentDir = path.join(root, 'content')
const document = parseDocument(JSON.parse(readFileSync(path.join(contentDir, 'document.json'), 'utf8')))
const inv = JSON.parse(
  readFileSync(path.join(contentDir, 'mapeamento', 'inventory.json'), 'utf8'),
) as InventoryDocument
const flowMap = inventoryDocumentToFlowMap(inv)

let mismatches = 0

for (const section of document.sections.filter((s) => s.strategy === 'flow')) {
  const mdxPath = path.join(contentDir, section.source)
  const mdx = mdxFileToFlowPayload(section.source, readFileSync(mdxPath, 'utf8'))
  const invPayload = flowSectionFromInventory(section.id, flowMap, {
    kicker: mdx.kicker,
    sheetVariant: mdx.sheetVariant,
  })
  if (!invPayload) continue
  const a = invPayload.blocks
  const b = mdx.blocks

  const countMismatch = a.length !== b.length
  const tablesA = tableSignature(a)
  const tablesB = tableSignature(b)
  const tableMismatch = tablesA.join('\n') !== tablesB.join('\n')

  if (!countMismatch && !tableMismatch) continue
  mismatches++

  console.log(`\n=== ${section.id} (blocks ${a.length} vs ${b.length}) ===`)
  if (tableMismatch) {
    console.log('inventory tables:', tablesA)
    console.log('mdx tables:     ', tablesB)
  }
  if (countMismatch) {
    const key = (bl: FlowBlock): string => {
      if (bl.type === 'paragraph' || bl.type === 'heading') {
        const t = bl.type === 'heading' ? bl.text : bl.runs.map((r) => r.text).join('')
        return `${bl.type}:${t.slice(0, 72).replace(/\s+/g, ' ')}`
      }
      if (bl.type === 'table') return `table:${bl.headers.join('|').slice(0, 40)}`
      return bl.type
    }
    const invSet = new Set(a.map(key))
    const mdxOnly = b.filter((bl) => !invSet.has(key(bl)))
    const invOnly = a.filter((bl) => !new Set(b.map(key)).has(key(bl)))
    if (mdxOnly.length) {
      console.log('mdx-only:')
      for (const bl of mdxOnly.slice(0, 6)) console.log(' -', key(bl))
    }
    if (invOnly.length) {
      console.log('inventory-only:')
      for (const bl of invOnly.slice(0, 6)) console.log(' -', key(bl))
    }
  }
}

if (mismatches === 0) {
  console.log('All flow sections match block counts and table signatures.')
} else {
  process.exitCode = 1
}
