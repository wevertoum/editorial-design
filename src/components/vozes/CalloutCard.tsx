import type { ReactNode } from 'react'

type CalloutCardProps = {
  title: string
  children: ReactNode
}

export function CalloutCard({ title, children }: CalloutCardProps) {
  return (
    <div className="callout-card">
      <p className="callout-card-title">{title}</p>
      <div className="callout-card-body">{children}</div>
    </div>
  )
}
