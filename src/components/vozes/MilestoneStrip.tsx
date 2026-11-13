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

/** Separa "2008 a 2010" / "2007 e 2008" em ano 1 + filete vertical + ano 2. */
function renderYearParts(year: string): ReactNode {
  const trimmed = year.trim()
  const range = trimmed.match(/^(\d{4})\s+(?:a|e)\s+(\d{4})(?:\s*\([^)]+\))?$/i)
  if (!range) {
    return <span className="milestone-strip-year-num">{trimmed}</span>
  }
  const [, start, end] = range
  return (
    <>
      <span className="milestone-strip-year-num">{start}</span>
      <span className="milestone-strip-year-rule" aria-hidden="true" />
      <span className="milestone-strip-year-num">{end}</span>
    </>
  )
}

export function MilestoneItem({ year, label }: MilestoneItemProps) {
  const trimmedYear = year.trim()
  const isRange = /^(\d{4})\s+(?:a|e)\s+(\d{4})(?:\s*\([^)]+\))?$/i.test(trimmedYear)
  return (
    <li className="milestone-strip-item">
      <p
        className={
          isRange ? 'milestone-strip-year milestone-strip-year--range' : 'milestone-strip-year'
        }
        {...(isRange ? { 'aria-label': trimmedYear } : {})}
      >
        {renderYearParts(year)}
      </p>
      <p className="milestone-strip-label">{renderInlineText(label)}</p>
    </li>
  )
}
