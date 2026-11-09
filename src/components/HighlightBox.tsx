import type { ReactNode } from 'react'

type HighlightBoxProps = {
  title?: string
  variant?: 'note' | 'caution'
  children?: ReactNode
}

export function HighlightBox({ title, variant = 'note', children }: HighlightBoxProps) {
  return (
    <div className={`highlight highlight-${variant}`}>
      {title ? <p className="highlight-title">{title}</p> : null}
      <div className="highlight-body">{children}</div>
    </div>
  )
}
