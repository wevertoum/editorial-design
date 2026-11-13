import type { ReactNode } from 'react'
import { renderInlineText } from '../../content/renderRuns'

type MilestoneStripProps = {
  title?: string
  /** Pares [ano, marco] — forma preferida no MDX e no inventário. */
  items?: string[][]
  columns?: 1 | 2
  className?: string
  children?: ReactNode
}

function renderMilestoneItems(entries: string[][]) {
  return entries.map(([year, body], index) => (
    <MilestoneItem key={`${year}-${index}`} year={year} label={body} />
  ))
}

export function MilestoneStrip({ title, items, columns = 1, className, children }: MilestoneStripProps) {
  const label = title?.trim() || 'Marcos da organização'
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const colClass = columns === 2 ? ' milestone-strip--cols-2' : ''
  const useTwoColumns = columns === 2 && items && items.length > 0
  const splitAt = useTwoColumns ? Math.ceil(items.length / 2) : 0
  const primaryColumn = useTwoColumns ? items.slice(0, splitAt) : []
  const secondaryColumn = useTwoColumns ? items.slice(splitAt) : []

  return (
    <section className={`milestone-strip${colClass}${extra}`} aria-label={label}>
      {title?.trim() ? (
        <p className="milestone-strip-title">{title.trim()}</p>
      ) : null}
      {useTwoColumns ? (
        <div className="milestone-strip-columns">
          <ol className="milestone-strip-list milestone-strip-column">{renderMilestoneItems(primaryColumn)}</ol>
          <ol className="milestone-strip-list milestone-strip-column">{renderMilestoneItems(secondaryColumn)}</ol>
        </div>
      ) : (
        <ol className="milestone-strip-list">
          {items ? renderMilestoneItems(items) : children}
        </ol>
      )}
    </section>
  )
}

type MilestoneItemProps = {
  year: string
  label: string
}

const RANGE_YEAR = /^(\d{4})\s+(?:a|e)\s+(\d{4})(?:\s*\([^)]+\))?$/i

export function MilestoneItem({ year, label }: MilestoneItemProps) {
  const trimmedYear = year.trim()
  const range = trimmedYear.match(RANGE_YEAR)
  const body = <p className="milestone-strip-label">{renderInlineText(label)}</p>

  if (range) {
    const [, start, end] = range
    return (
      <li className="milestone-strip-item milestone-strip-item--range" aria-label={trimmedYear}>
        <div className="milestone-strip-year-stack">
          <span className="milestone-strip-year-num">{start}</span>
          <span className="milestone-strip-year-rule" aria-hidden="true" />
          <span className="milestone-strip-year-num">{end}</span>
        </div>
        {body}
      </li>
    )
  }

  return (
    <li className="milestone-strip-item">
      <span className="milestone-strip-year-num">{trimmedYear}</span>
      {body}
    </li>
  )
}
