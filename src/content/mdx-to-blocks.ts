import type { FlowBlock, FlowSectionPayload, TextRun } from './bundle-types'

const LAYOUT_TAGS = new Set(['VozesLayout', 'VozesMain', 'VozesRail'])
/** Inner text is stored on the component, not reparsed as prose blocks. */
const JSX_BODY_COMPONENTS = new Set(['SourceNote'])
const HEADING_LEVEL = [1, 2, 3, 4, 5, 6] as const

export type MdxFrontmatter = {
  kicker?: string
  sheetVariant?: string
}

export function parseMdxFrontmatter(source: string): MdxFrontmatter {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    return {}
  }
  const fm: MdxFrontmatter = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/)
    if (!kv) continue
    const raw = kv[2].trim()
    const unquoted =
      (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
        ? raw.slice(1, -1)
        : raw
    if (kv[1] === 'kicker') fm.kicker = unquoted
    if (kv[1] === 'sheetVariant') fm.sheetVariant = unquoted
  }
  return fm
}

export function stripMdxFrontmatter(source: string): string {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

function stripLayoutWrappers(body: string): string {
  let result = body
  for (const tag of LAYOUT_TAGS) {
    result = result.replace(new RegExp(`<${tag}[^>]*>\\s*`, 'g'), '')
    result = result.replace(new RegExp(`\\s*</${tag}>`, 'g'), '\n')
  }
  return result.trim()
}

function readBraceExpression(source: string, start: number): { value: unknown; end: number } | undefined {
  if (source[start] !== '{') return undefined
  let depth = 0
  let inString: '"' | "'" | null = null
  let escaped = false
  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === inString) {
        inString = null
      }
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = ch
      continue
    }
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        const raw = source.slice(start, i + 1)
        const inner = raw.slice(1, -1).trim()
        if (inner.startsWith('"') || inner.startsWith("'")) {
          return { value: JSON.parse(inner.replace(/^'/, '"').replace(/'$/, '"')), end: i + 1 }
        }
        try {
          return { value: JSON.parse(inner), end: i + 1 }
        } catch {
          return { value: inner, end: i + 1 }
        }
      }
    }
  }
  return undefined
}

function readQuoted(source: string, start: number): { value: string; end: number } | undefined {
  const quote = source[start]
  if (quote !== '"' && quote !== "'") return undefined
  let value = ''
  let escaped = false
  for (let i = start + 1; i < source.length; i++) {
    const ch = source[i]
    if (escaped) {
      value += ch
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      continue
    }
    if (ch === quote) {
      return { value, end: i + 1 }
    }
    value += ch
  }
  return undefined
}

function parseJsxAttributes(attrString: string): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  let i = 0
  while (i < attrString.length) {
    while (i < attrString.length && /\s/.test(attrString[i])) i++
    const nameMatch = attrString.slice(i).match(/^([A-Za-z_][\w-]*)\s*=\s*/)
    if (!nameMatch) break
    const name = nameMatch[1]
    i += nameMatch[0].length
    if (attrString[i] === '"') {
      const quoted = readQuoted(attrString, i)
      if (!quoted) break
      props[name] = quoted.value
      i = quoted.end
      continue
    }
    if (attrString[i] === "'") {
      const quoted = readQuoted(attrString, i)
      if (!quoted) break
      props[name] = quoted.value
      i = quoted.end
      continue
    }
    if (attrString[i] === '{') {
      const expr = readBraceExpression(attrString, i)
      if (!expr) break
      props[name] = expr.value
      i = expr.end
      continue
    }
    break
  }
  return props
}

type ParsedJsx = {
  name: string
  props: Record<string, unknown>
  selfClosing: boolean
  inner: string
  end: number
}

function parseJsxElement(source: string, index: number): ParsedJsx | undefined {
  if (source[index] !== '<') return undefined
  const tagMatch = source.slice(index).match(/^<([A-Z][A-Za-z0-9]*)/)
  if (!tagMatch) return undefined
  const name = tagMatch[1]
  const tagStart = index + tagMatch[0].length
  let i = tagStart
  let openEnd = -1
  while (i < source.length) {
    if (source[i] === '>') {
      openEnd = i
      break
    }
    i++
  }
  if (openEnd < 0) return undefined
  const attrs = source.slice(tagStart, openEnd)
  const selfClosing = /\s\/\s*$/.test(attrs) || attrs.trimEnd().endsWith('/')
  const attrString = attrs.replace(/\s*\/\s*$/, '')
  const props = parseJsxAttributes(attrString)
  const openTagEnd = openEnd + 1

  if (selfClosing) {
    return { name, props, selfClosing: true, inner: '', end: openTagEnd }
  }

  const close = `</${name}>`
  const closeIndex = source.indexOf(close, openTagEnd)
  if (closeIndex < 0) {
    return { name, props, selfClosing: true, inner: '', end: openTagEnd }
  }
  const inner = source.slice(openTagEnd, closeIndex)
  return { name, props, selfClosing: false, inner, end: closeIndex + close.length }
}

function componentToBlocks(name: string, props: Record<string, unknown>): FlowBlock[] {
  if (name === 'Figure' && typeof props.src === 'string') {
    return [
      {
        type: 'image',
        src: props.src,
        alt: typeof props.alt === 'string' ? props.alt : undefined,
        caption: typeof props.caption === 'string' ? props.caption : undefined,
        credit: typeof props.credit === 'string' ? props.credit : undefined,
      },
    ]
  }
  if (
    name === 'EditorialTable' &&
    Array.isArray(props.columns) &&
    Array.isArray(props.rows) &&
    props.columns.every((c) => typeof c === 'string') &&
    props.rows.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'))
  ) {
    return [
      {
        type: 'table',
        headers: props.columns as string[],
        rows: props.rows as string[][],
        caption: typeof props.caption === 'string' ? props.caption : undefined,
        variant: typeof props.variant === 'string' ? props.variant : undefined,
      },
    ]
  }
  if (name === 'SourceNote') {
    const children =
      typeof props.children === 'string'
        ? props.children
        : typeof props.children === 'undefined' && typeof props.body === 'string'
          ? props.body
          : undefined
    return [{ type: 'component', name: 'SourceNote', props: children !== undefined ? { children } : props }]
  }
  return [{ type: 'component', name, props }]
}

function findParagraphEnd(source: string, start: number): number {
  let i = start
  while (i < source.length) {
    if (source[i] === '<' || (source[i] === '#' && (i === 0 || source[i - 1] === '\n'))) {
      break
    }
    if (source[i] === '\n') {
      const next = source.slice(i).match(/^\n+/)
      if (next && next[0].length >= 2) {
        return i
      }
    }
    i++
  }
  return i
}

function headingLevel(mark: string): (typeof HEADING_LEVEL)[number] {
  const level = mark.length
  if (level >= 1 && level <= 6) return level as (typeof HEADING_LEVEL)[number]
  return 2
}

function parseInlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = []
  const pattern = /(\*\*[^*]+\*\*|_[^_]+_)/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      runs.push({ text: text.slice(last, match.index) })
    }
    const token = match[1]
    if (token.startsWith('**')) {
      runs.push({ text: token.slice(2, -2), bold: true })
    } else {
      runs.push({ text: token.slice(1, -1), italic: true })
    }
    last = match.index + token.length
  }
  if (last < text.length) {
    runs.push({ text: text.slice(last) })
  }
  return runs.length > 0 ? runs : [{ text }]
}

export function parseFlowBlocks(body: string): FlowBlock[] {
  const normalized = stripLayoutWrappers(body)
  const blocks: FlowBlock[] = []
  let i = 0

  while (i < normalized.length) {
    while (i < normalized.length && /\s/.test(normalized[i])) i++
    if (i >= normalized.length) break

    const rest = normalized.slice(i)
    const heading = rest.match(/^(#{1,6})\s+(.+?)(\r?\n|$)/)
    if (heading) {
      const text = heading[2].trim()
      blocks.push({
        type: 'heading',
        level: headingLevel(heading[1]),
        text,
        runs: parseInlineRuns(text),
      })
      i += heading[0].length
      continue
    }

    if (normalized[i] === '<') {
      const el = parseJsxElement(normalized, i)
      if (el) {
        if (LAYOUT_TAGS.has(el.name)) {
          if (el.inner.trim()) {
            blocks.push(...parseFlowBlocks(el.inner))
          }
          i = el.end
          continue
        }
        if (JSX_BODY_COMPONENTS.has(el.name) && el.inner.trim()) {
          blocks.push(
            ...componentToBlocks(el.name, { ...el.props, children: el.inner.trim() }),
          )
        } else {
          blocks.push(...componentToBlocks(el.name, el.props))
          if (!el.selfClosing && el.inner.trim() && el.name !== 'Figure') {
            blocks.push(...parseFlowBlocks(el.inner))
          }
        }
        i = el.end
        continue
      }
    }

    const end = findParagraphEnd(normalized, i)
    const text = normalized.slice(i, end).replace(/\s+/g, ' ').trim()
    if (text) {
      blocks.push({ type: 'paragraph', runs: parseInlineRuns(text) })
    }
    i = end
    while (i < normalized.length && /\s/.test(normalized[i])) i++
  }

  return blocks
}

export function mdxFileToFlowPayload(_source: string, raw: string): FlowSectionPayload {
  const frontmatter = parseMdxFrontmatter(raw)
  const body = stripMdxFrontmatter(raw)
  return {
    kind: 'flow',
    derivedFrom: 'mdx',
    kicker: frontmatter.kicker,
    sheetVariant: frontmatter.sheetVariant,
    blocks: parseFlowBlocks(body),
  }
}
