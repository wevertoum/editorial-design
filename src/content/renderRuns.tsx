import type { ReactNode } from 'react'
import type { TextRun } from './bundle-types'
import { parseInlineRuns } from './inline-markdown'

export function renderInlineText(text: string): ReactNode {
  return renderRuns(parseInlineRuns(text))
}

export function renderRuns(runs: TextRun[]): ReactNode {
  return runs.map((run, index) => {
    let node: ReactNode = run.text
    if (run.bold && run.italic) {
      node = (
        <strong>
          <em>{run.text}</em>
        </strong>
      )
    } else if (run.bold) {
      node = <strong>{run.text}</strong>
    } else if (run.italic) {
      node = <em>{run.text}</em>
    }
    if (run.href) {
      node = (
        <a href={run.href} target="_blank" rel="noopener noreferrer">
          {node}
        </a>
      )
    }
    return <span key={index}>{node}</span>
  })
}
