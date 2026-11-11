import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath =
  process.env.AUSTRALIA_JSON ??
  '/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/03_InDesign/_render/data/content-australia.json'

type Run = { text: string; italic?: boolean; bold?: boolean }

function runsToInline(runs: Run[]): string {
  return runs
    .map((run) => {
      let text = run.text.replace(/\{/g, '\\{')
      if (run.bold) text = `**${text}**`
      if (run.italic) text = `*${text}*`
      return text
    })
    .join('')
}

function yamlQuote(value: string): string {
  return JSON.stringify(value)
}

function pageHeader(kicker: string): string {
  return `---\nkicker: ${yamlQuote(kicker)}\nsheetVariant: vozes-report\n---\n\n`
}

const raw = JSON.parse(readFileSync(sourcePath, 'utf8')) as {
  opening: { code: string; title: string; lead: Run[] }
  pages: Array<{
    id: string
    type?: string
    sectionVar: string
    blocks: unknown[]
    rail?: Record<string, unknown>
    railAfter?: Record<string, unknown>
    introTitle?: string
    introBody?: string
    introBodyRight?: string
    nodeIds?: string[]
    timelineSpread?: number
  }>
  timelineCross: Array<{
    id: string
    year: string
    curriculo: { labelLong: string }
    org: { labelLong: string }
  }>
}

const byId = new Map(raw.timelineCross.map((node) => [node.id, node]))

function blockToMdx(block: Record<string, unknown>): string {
  const type = block.type as string
  if (type === 'opening') {
    const lead = runsToInline(raw.opening.lead)
    return `<CountryOpening code="${raw.opening.code}" title="${raw.opening.title.replace(/"/g, '&quot;')}" lead={${JSON.stringify(lead)}} />\n\n`
  }
  if (type === 'section') {
    const level = block.level as number
    const text = runsToInline(block.runs as Run[])
    const hash = '#'.repeat(Math.min(Math.max(level, 1), 3))
    if (block.role === 'org') {
      return `<h${level} className="org-section-title">${text}</h${level}>\n\n`
    }
    return `${hash} ${text}\n\n`
  }
  if (type === 'body') {
    return `${runsToInline(block.runs as Run[])}\n\n`
  }
  if (type === 'list') {
    const item = runsToInline(block.runs as Run[])
    return `<DetailList>\n\n${item}\n\n</DetailList>\n\n`
  }
  if (type === 'source') {
    return `<SourceNote>${runsToInline(block.runs as Run[])}</SourceNote>\n\n`
  }
  if (type === 'actorsTable') {
    return `<EditorialTable variant="vozes" caption="Principais atores" columns={${JSON.stringify(block.headers)}} rows={${JSON.stringify(block.rows)}} />\n\n`
  }
  if (type === 'timelineSimple') {
    const nodes = (block.nodes as Array<{ year: string; label: string }>)
      .map((n) => `  <MilestoneItem year="${n.year}" label={${JSON.stringify(n.label)}} />`)
      .join('\n')
    return `<MilestoneStrip title={${JSON.stringify(block.title as string)}}>\n${nodes}\n</MilestoneStrip>\n\n`
  }
  if (type === 'figure') {
    const src = block.src as string
    const alt = block.alt as string
    const caption = block.caption as string
    const credit = block.credit as string | undefined
    const creditAttr = credit ? ` credit={${JSON.stringify(credit)}}` : ''
    return `<Figure src="${src}" alt={${JSON.stringify(alt)}} caption={${JSON.stringify(caption)}}${creditAttr} />\n\n`
  }
  return ''
}

function railToMdx(rail: Record<string, unknown>): string {
  const railType = rail.type as string
  if (railType === 'profile') {
    return `<ProfileCard
  label={${JSON.stringify(rail.label as string)}}
  name={${JSON.stringify(rail.name as string)}}
  role={${JSON.stringify(rail.role as string)}}
  bio={${JSON.stringify(rail.bio as string)}}
  photo="media/perfil-anna-ritzema-duotone-circle.png"
/>\n`
  }
  if (railType === 'callout') {
    const body = (rail.body as Array<{ runs: Run[] }>).map((p) => runsToInline(p.runs)).join('\n\n')
    return `<CalloutCard title={${JSON.stringify(rail.title as string)}}>\n\n${body}\n\n</CalloutCard>\n`
  }
  if (railType === 'index' || railType === 'facts') {
    const items = (rail.items as Array<Record<string, unknown>>)
      .map((item) => {
        const term = item.termItalic ? `*${item.term}*` : (item.term as string)
        const value = item.valueItalic ? `*${item.value}*` : (item.value as string)
        return `  <RailItem term={${JSON.stringify(term)}} value={${JSON.stringify(value)}} />`
      })
      .join('\n')
    return `<FactsRail title={${JSON.stringify((rail.title as string) || '')}}>\n${items}\n</FactsRail>\n`
  }
  return ''
}

function composePage(page: (typeof raw.pages)[number], includeRailAfter = false): string {
  let main = page.blocks.map((b) => blockToMdx(b as Record<string, unknown>)).join('')
  let rail = ''
  if (page.rail) rail += railToMdx(page.rail)
  if (includeRailAfter && page.railAfter) rail += railToMdx(page.railAfter)
  const orgClass = page.blocks.some((b) => (b as { role?: string }).role === 'org') ? ' org-panel-page' : ''
  const layoutClass = orgClass.trim() ? ` className="${orgClass.trim()}"` : ''
  return `${pageHeader(page.sectionVar)}<VozesLayout${layoutClass}>\n<VozesMain>\n\n${main.trim()}\n\n</VozesMain>\n<VozesRail>\n\n${rail.trim()}\n\n</VozesRail>\n</VozesLayout>\n`
}

const flowPages = raw.pages.filter((p) => (p.type ?? '') !== 'D')
const chapterNames = [
  'australia-01-opening.mdx',
  'australia-02-curriculum.mdx',
  'australia-03-actors.mdx',
  'australia-04-acsa.mdx',
  'australia-05-acsa-cont.mdx',
]

const chaptersDir = path.join(root, 'content', 'chapters')
for (const file of readdirSync(chaptersDir)) {
  if (file.endsWith('.mdx')) unlinkSync(path.join(chaptersDir, file))
}

chapterNames.forEach((name, index) => {
  const page = flowPages[index]
  if (!page) throw new Error(`Missing flow page index ${index}`)
  const includeAfter = index === 0
  writeFileSync(path.join(chaptersDir, name), composePage(page, includeAfter), 'utf8')
})

function dualTrackJson(page: (typeof raw.pages)[number], part: 'a' | 'b'): string {
  const ids = page.nodeIds ?? []
  const half = Math.ceil(ids.length / 2)
  const slice = part === 'a' ? ids.slice(0, half) : ids.slice(half)
  const nodes = slice.map((id) => {
    const node = byId.get(id)
    if (!node) throw new Error(`Unknown timeline node ${id}`)
    return {
      id: node.id,
      year: node.year,
      curriculo: node.curriculo.labelLong,
      organizacao: node.org.labelLong,
    }
  })
  const content = {
    variant: 'dual-track',
    kicker: page.sectionVar,
    title: page.introTitle ?? 'Onde as trajetórias se cruzam',
    lede: [page.introBody ?? ''].filter(Boolean),
    spreadPart: part,
    spreadIndex: page.timelineSpread ?? 1,
    introBodyRight: part === 'b' ? page.introBodyRight : undefined,
    sourceNote: part === 'b' ? 'Fontes: sites oficiais ACARA e ACSA; documentação do projeto Mapeamento.' : undefined,
    nodes,
  }
  return `${JSON.stringify(content, null, 2)}\n`
}

const timelinesDir = path.join(root, 'content', 'timelines')
for (const file of readdirSync(timelinesDir)) {
  if (file.endsWith('.json')) unlinkSync(path.join(timelinesDir, file))
}

const tl1 = raw.pages.find((p) => p.id === 'au-tl-1')
const tl2 = raw.pages.find((p) => p.id === 'au-tl-2')
if (!tl1 || !tl2) throw new Error('Missing timeline page definitions')

writeFileSync(path.join(timelinesDir, 'australia-cross-1a.json'), dualTrackJson(tl1, 'a'), 'utf8')
writeFileSync(path.join(timelinesDir, 'australia-cross-1b.json'), dualTrackJson(tl1, 'b'), 'utf8')
writeFileSync(path.join(timelinesDir, 'australia-cross-2a.json'), dualTrackJson(tl2, 'a'), 'utf8')
writeFileSync(path.join(timelinesDir, 'australia-cross-2b.json'), dualTrackJson(tl2, 'b'), 'utf8')

const infographicsDir = path.join(root, 'content', 'infographics')
for (const file of readdirSync(infographicsDir)) {
  if (file.endsWith('.json')) unlinkSync(path.join(infographicsDir, file))
}

const document = {
  id: 'mapeamento-australia-piloto',
  language: 'pt-BR',
  title: 'Mapeamento de Organizações',
  subtitle: 'Piloto — Austrália / ACSA',
  author: 'Vozes da Educação',
  sections: [
    { id: 'au-01-opening', strategy: 'flow', layout: 'standard', source: 'chapters/australia-01-opening.mdx' },
    { id: 'au-02-curriculum', strategy: 'flow', layout: 'standard', source: 'chapters/australia-02-curriculum.mdx' },
    { id: 'au-03-actors', strategy: 'flow', layout: 'standard', source: 'chapters/australia-03-actors.mdx' },
    { id: 'au-04-acsa', strategy: 'flow', layout: 'standard', source: 'chapters/australia-04-acsa.mdx' },
    { id: 'au-05-acsa-cont', strategy: 'flow', layout: 'standard', source: 'chapters/australia-05-acsa-cont.mdx' },
    { id: 'au-06-cross-1a', strategy: 'structured', layout: 'timeline', source: 'timelines/australia-cross-1a.json' },
    { id: 'au-07-cross-1b', strategy: 'structured', layout: 'timeline', source: 'timelines/australia-cross-1b.json' },
    { id: 'au-08-cross-2a', strategy: 'structured', layout: 'timeline', source: 'timelines/australia-cross-2a.json' },
    { id: 'au-09-cross-2b', strategy: 'structured', layout: 'timeline', source: 'timelines/australia-cross-2b.json' },
  ],
}

writeFileSync(path.join(root, 'content', 'document.json'), `${JSON.stringify(document, null, 2)}\n`, 'utf8')
console.log('Generated Australia pilot: 5 chapters, 4 timeline pages, document.json')
