import type { FlowBlock, TextRun } from './bundle-types'

const BOLD_ITALIC_RE = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g

function parseBoldItalicSegment(text: string): TextRun[] {
  const runs: TextRun[] = []
  let last = 0
  let match: RegExpExecArray | null
  BOLD_ITALIC_RE.lastIndex = 0
  while ((match = BOLD_ITALIC_RE.exec(text)) !== null) {
    if (match.index > last) {
      runs.push({ text: text.slice(last, match.index) })
    }
    const token = match[1]
    if (token.startsWith('***')) {
      runs.push({ text: token.slice(3, -3), bold: true, italic: true })
    } else if (token.startsWith('**')) {
      runs.push({ text: token.slice(2, -2), bold: true })
    } else if (token.startsWith('*')) {
      runs.push({ text: token.slice(1, -1), italic: true })
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

/**
 * Parse lightweight inline MDX/markdown: bold, italic, and [label](url) links.
 */
export function parseInlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = []
  let i = 0
  while (i < text.length) {
    const open = text.indexOf('[', i)
    if (open < 0) {
      runs.push(...parseBoldItalicSegment(text.slice(i)))
      break
    }
    if (open > i) {
      runs.push(...parseBoldItalicSegment(text.slice(i, open)))
    }
    const closeLabel = text.indexOf(']', open + 1)
    if (closeLabel < 0 || text[closeLabel + 1] !== '(') {
      runs.push({ text: text[open] })
      i = open + 1
      continue
    }
    const closeUrl = text.indexOf(')', closeLabel + 2)
    if (closeUrl < 0) {
      runs.push({ text: text.slice(open, closeLabel + 1) })
      i = closeLabel + 1
      continue
    }
    const label = text.slice(open + 1, closeLabel)
    const href = text.slice(closeLabel + 2, closeUrl).trim()
    if (!href || /[\s"]/.test(href)) {
      runs.push(...parseBoldItalicSegment(text.slice(open, closeUrl + 1)))
      i = closeUrl + 1
      continue
    }
    for (const run of parseBoldItalicSegment(label)) {
      runs.push({ ...run, href })
    }
    i = closeUrl + 1
  }
  return runs.length > 0 ? runs : [{ text }]
}

export function flowBlockHasLinkRuns(block: FlowBlock): boolean {
  if (block.type === 'paragraph' || block.type === 'heading') {
    return Boolean(block.runs?.some((run) => run.href))
  }
  return false
}

/** When inventory paragraphs are plain text, keep structure but take linked runs from MDX. */
export function mergeMdxLinkRuns(inventoryBlocks: FlowBlock[], mdxBlocks: FlowBlock[]): FlowBlock[] {
  const len = Math.min(inventoryBlocks.length, mdxBlocks.length)
  const merged = inventoryBlocks.map((block, index) => {
    if (index >= len) return block
    const mdx = mdxBlocks[index]
    if (block.type !== mdx.type) return block
    if (block.type === 'paragraph' && mdx.type === 'paragraph' && flowBlockHasLinkRuns(mdx) && mdx.runs) {
      return { ...block, runs: mdx.runs }
    }
    if (block.type === 'heading' && mdx.type === 'heading' && flowBlockHasLinkRuns(mdx) && mdx.runs) {
      return { ...block, runs: mdx.runs, text: mdx.text }
    }
    return block
  })
  return merged
}
