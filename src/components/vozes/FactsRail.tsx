import type { ReactNode } from 'react'

type FactsRailProps = {
  title?: string
  children: ReactNode
}

export function FactsRail({ title, children }: FactsRailProps) {
  return (
    <div className="facts-rail">
      {title ? <p className="facts-rail-title">{title}</p> : null}
      <dl className="facts-rail-list">{children}</dl>
    </div>
  )
}

type RailItemProps = {
  term: string
  value: string
}

export function RailItem({ term, value }: RailItemProps) {
  return (
    <div className="facts-rail-item">
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  )
}
