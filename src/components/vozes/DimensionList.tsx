import { Children, type ReactNode } from 'react'

type DimensionListProps = {
  /** Padded figure shown left of the block, e.g. "08". */
  number: string
  children: ReactNode
}

/**
 * Numbered fact block for curriculum dimensions (large dark-green figure + title + body).
 * Not a bullet list — use DetailList for process phases and similar.
 *
 * First child = title row (shares baseline with the number); remaining children = body copy.
 */
export function DimensionList({ number, children }: DimensionListProps) {
  const figure = number.trim()
  if (!figure) {
    throw new Error('DimensionList requires a number prop (e.g. number="08")')
  }

  const parts = Children.toArray(children).filter((child) => {
    if (typeof child === 'string') return child.trim().length > 0
    return child != null
  })
  const title = parts[0] ?? null
  const body = parts.slice(1)

  return (
    <div className="dimension-list-item">
      <span className="dimension-list-number" aria-hidden="true">
        {figure}
      </span>
      {title ? <div className="dimension-list-title">{title}</div> : null}
      {body.length > 0 ? <div className="dimension-list-copy">{body}</div> : null}
    </div>
  )
}
