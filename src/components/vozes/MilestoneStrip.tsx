import type { ReactNode } from 'react'
import { renderInlineText } from '../../content/renderRuns'

type MilestoneStripProps = {
  title?: string
  /** Pares [ano, marco] — forma preferida no MDX e no inventário. */
  items?: string[][]
  className?: string
  children?: ReactNode
}

export function MilestoneStrip({ title, items, className, children }: MilestoneStripProps) {
  const label = title?.trim() || 'Marcos da organização'
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return (
    <section className={`milestone-strip${extra}`} aria-label={label}>
      {title?.trim() ? (
        <p className="milestone-strip-title">{title.trim()}</p>
      ) : null}
      <ol className="milestone-strip-list">
        {items
          ? items.map(([year, body], index) => (
              <MilestoneItem key={`${year}-${index}`} year={year} label={body} />
            ))
          : children}
      </ol>
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
