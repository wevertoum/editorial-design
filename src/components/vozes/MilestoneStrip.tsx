import type { ReactNode } from 'react'

type MilestoneStripProps = {
  title: string
  children: ReactNode
}

export function MilestoneStrip({ title, children }: MilestoneStripProps) {
  return (
    <section className="milestone-strip" aria-label={title}>
      <h3 className="milestone-strip-title">{title}</h3>
      <ol className="milestone-strip-list">{children}</ol>
    </section>
  )
}

type MilestoneItemProps = {
  year: string
  label: string
}

export function MilestoneItem({ year, label }: MilestoneItemProps) {
  return (
    <li className="milestone-strip-item">
      <span className="milestone-strip-year">{year}</span>
      <span className="milestone-strip-label">{label}</span>
    </li>
  )
}
