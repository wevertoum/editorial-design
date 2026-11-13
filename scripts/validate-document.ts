import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import {
  assertBundleMatchesDocument,
  ContentError,
  parseDocument,
  parseInfographic,
  parsePublicationBundle,
  parseTimeline,
} from '../src/content/schema'
import { assertDesignTokens, assertLength, readCustomProperty, readText } from './design-tokens'

const root = process.cwd()
const contentDir = path.join(root, 'content')
const errors: string[] = []
/** Timelines embutidos em capítulos MDX (fora da ordem de leitura do manifesto). */
const embeddedTimelineSources = new Set([
  'timelines/australia-cruzamento-1-a.json',
  'timelines/australia-cruzamento-1-b.json',
  'timelines/usa-cruzamento-1-a.json',
  'timelines/usa-cruzamento-1-b.json',
  'timelines/england-cruzamento-1-a.json',
  'timelines/england-cruzamento-1-b.json',
  'timelines/england-cruzamento-3-a.json',
  'timelines/england-cruzamento-3-b.json',
  'timelines/nigeria-cruzamento-1-a.json',
  'timelines/nigeria-cruzamento-1-b.json',
  'timelines/chile-cruzamento-1-a.json',
  'timelines/chile-cruzamento-1-b.json',
])

const allowedComponents = new Set([
  'ActorBand',
  'CalloutCard',
  'Columns',
  'CountryOpening',
  'DetailList',
  'DetailListGrid',
  'DualTrackEmbed',
  'DimensionList',
  'EditorialTable',
  'FactsRail',
  'Figure',
  'Heading',
  'HighlightBox',
  'MilestoneItem',
  'MilestoneStrip',
  'OrgHierarchyFlow',
  'OrgHierarchyStep',
  'PageStack',
  'ParticipationBox',
  'ProfileCard',
  'PullQuote',
  'RailItem',
  'SourceNote',
  'TrajetoriaBox',
  'VozesLayout',
  'VozesMain',
  'VozesRail',
])

function fail(message: string) {
  errors.push(message)
}

function guard(run: () => void) {
  try {
    run()
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }
}

const manifestPath = path.join(contentDir, 'document.json')
const manifest = readJson(manifestPath)
const document = guardValue(() => parseDocument(manifest))

guard(() => {
  const tokensFile = 'src/styles/tokens.css'
  const tokens = readText(path.join(root, tokensFile))
  assertDesignTokens(tokens, tokensFile)
  for (const name of ['--page-width', '--page-height', '--margin-top', '--margin-bottom', '--margin-inner', '--margin-outer', '--bleed']) {
    assertLength(readCustomProperty(tokens, name, tokensFile), tokensFile, name)
  }

  const digitalFile = 'src/styles/digital.css'
  const digital = readText(path.join(root, digitalFile))
  if (readCustomProperty(digital, '--bleed', digitalFile).replace(/\s+/g, '') !== '0mm') {
    throw new Error(`${digitalFile} must set --bleed to 0mm`)
  }

  const printFile = 'src/styles/print.css'
  const printCss = readText(path.join(root, printFile))
  assertLength(readCustomProperty(printCss, '--bleed', printFile), printFile, '--bleed')
  assertLength(readCustomProperty(printCss, '--margin-inner', printFile), printFile, '--margin-inner')
})

const referenced = new Set<string>()
const referencedAssets = new Set<string>()

if (document) {
  for (const section of document.sections) {
    const absolute = path.join(contentDir, section.source)
    referenced.add(section.source)
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      fail(`Missing content file: content/${section.source}`)
      continue
    }

    if (section.strategy === 'flow') {
      guard(() => checkMdx(absolute, section.source, referencedAssets))
    } else {
      const json = readJson(absolute)
      if (json === undefined) continue
      guard(() => {
        if (section.layout === 'timeline') parseTimeline(json, section.source)
        else parseInfographic(json, section.source)
        collectAssetStrings(json, referencedAssets)
      })
    }
  }

  guard(() => {
    for (const source of listContentFiles()) {
      if (!referenced.has(source) && !embeddedTimelineSources.has(source)) {
        throw new Error(`content/${source} is not listed in content/document.json`)
      }
    }
  })
}

guard(() => {
  const spreadPairs = new Map<string, { a?: { nodes: unknown[] }; b?: { nodes: unknown[]; overflowNodes?: unknown[] } }>()
  for (const source of embeddedTimelineSources) {
    const absolute = path.join(contentDir, source)
    if (!existsSync(absolute)) continue
    const json = readJson(absolute) as { nodes?: unknown[]; overflowNodes?: unknown[]; spreadPart?: string }
    const m = source.match(/^timelines\/(.+)-cruzamento-(\d+)-([ab])\.json$/)
    if (!m || !Array.isArray(json?.nodes)) continue
    const key = `${m[1]}-cruzamento-${m[2]}`
    const slot = spreadPairs.get(key) ?? {}
    if (m[3] === 'a') slot.a = { nodes: json.nodes }
    else slot.b = { nodes: json.nodes, overflowNodes: json.overflowNodes }
    spreadPairs.set(key, slot)
  }
  for (const [key, pair] of spreadPairs) {
    if (!pair.a || !pair.b) continue
    const overflow = pair.b.overflowNodes?.length ?? 0
    if (overflow > 0) continue
    const total = pair.a.nodes.length + pair.b.nodes.length
    if (total === 6 && (pair.a.nodes.length !== 3 || pair.b.nodes.length !== 3)) {
      throw new Error(
        `content/timelines/${key}: dual-track spread with 6 dates must use 3 nodes on part a and 3 on part b (got ${pair.a.nodes.length}+${pair.b.nodes.length})`,
      )
    }
  }
})

guard(() => {
  for (const asset of referencedAssets) {
    const relative = resolveAsset(asset)
    if (!existsSync(path.join(root, relative))) {
      throw new Error(`Missing asset "${asset}" (expected ${relative})`)
    }
  }
})

guard(() => collectSrcMediaReferences(referencedAssets))

guard(() => {
  const mediaDir = path.join(root, 'assets', 'media')
  if (!existsSync(mediaDir)) return
  for (const file of readdirSync(mediaDir)) {
    // Skip dotfiles and private working folders (e.g. _incoming portrait masters)
    if (file.startsWith('.') || file.startsWith('_')) continue
    const used = [...referencedAssets].some((asset) => resolveAsset(asset) === path.posix.join('assets/media', file) || resolveAsset(asset) === path.join('assets/media', file))
    if (!used) {
      throw new Error(`assets/media/${file} is not referenced by content`)
    }
  }
})

const bundlePath = path.join(contentDir, 'publication.bundle.json')
guard(() => {
  if (!document) return
  if (!existsSync(bundlePath)) {
    throw new Error(
      'Missing content/publication.bundle.json — run npm run export:bundle after content changes',
    )
  }
  const bundle = parsePublicationBundle(readJson(bundlePath))
  assertBundleMatchesDocument(bundle, document)
})

if (errors.length > 0) {
  console.error(`Document validation failed (${errors.length})`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Document validation passed')
if (document) {
  console.log(`${document.sections.length} sections · ${referencedAssets.size} asset reference(s)`)
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as unknown
  } catch (error) {
    fail(`${path.relative(root, file)} is not valid JSON (${error instanceof Error ? error.message : error})`)
    return undefined
  }
}

function guardValue<T>(run: () => T): T | undefined {
  try {
    return run()
  } catch (error) {
    fail(error instanceof ContentError || error instanceof Error ? error.message : String(error))
    return undefined
  }
}

function checkMdx(file: string, source: string, assets: Set<string>) {
  const text = readFileSync(file, 'utf8')
  if (text.trim() === '') {
    throw new Error(`${source} is empty`)
  }
  if (/^import\s/m.test(text) || /^export\s/m.test(text)) {
    throw new Error(`${source} should use the shared MDX components and frontmatter, not import or export statements`)
  }

  for (const match of text.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    const tag = match[1]
    if (tag && !allowedComponents.has(tag)) {
      throw new Error(`${source} uses unknown component <${tag}>. Allowed: ${[...allowedComponents].join(', ')}`)
    }
  }

  const patterns = [
    /\bsrc="([^"]+)"/g,
    /\bsrc='([^']+)'/g,
    /\bsrc=\{"([^"]+)"\}/g,
    /\bsrc=\{'([^']+)'\}/g,
    /\bphoto="([^"]+)"/g,
    /\bphoto=\{"([^"]+)"\}/g,
    /!\[[^\]]*\]\(([^)\s]+)\)/g,
  ]
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const ref = match[1]
      if (!ref || /^(https?:|data:|#|mailto:)/.test(ref)) {
        throw new Error(`${source} must use a local asset, not "${ref ?? ''}"`)
      }
      assets.add(ref)
    }
  }
}

function collectAssetStrings(value: unknown, assets: Set<string>) {
  if (typeof value === 'string') {
    if (/^(media|assets)\//.test(value) || value.startsWith('/media/')) assets.add(value)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectAssetStrings(item, assets)
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value)) collectAssetStrings(item, assets)
  }
}

function collectSrcMediaReferences(assets: Set<string>) {
  const srcDir = path.join(root, 'src')
  if (!existsSync(srcDir)) return
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        visit(absolute)
        continue
      }
      if (!/\.(tsx?|css)$/.test(entry.name)) continue
      const text = readFileSync(absolute, 'utf8')
      for (const match of text.matchAll(/\bmedia\/[a-zA-Z0-9._-]+\.[a-z0-9]+\b/g)) {
        assets.add(match[0])
      }
    }
  }
  visit(srcDir)
}

function resolveAsset(reference: string): string {
  const clean = reference.replace(/^\.?\//, '')
  if (clean.startsWith('assets/')) return clean
  return path.posix.join('assets', clean)
}

function listContentFiles(): string[] {
  const folders = ['chapters', 'timelines', 'infographics']
  const files: string[] = []
  for (const folder of folders) {
    const directory = path.join(contentDir, folder)
    if (!existsSync(directory)) continue
    for (const file of readdirSync(directory)) {
      if (file.startsWith('.')) continue
      const absolute = path.join(directory, file)
      if (statSync(absolute).isFile()) files.push(path.posix.join(folder, file))
    }
  }
  return files
}
