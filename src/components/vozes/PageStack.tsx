import type { ReactNode } from 'react'

type PageStackProps = {
  children: ReactNode
  className?: string
}

/**
 * One-page flex column: put `vozes-page-stack-foot` on the last child to pin it
 * to the bottom margin (ActorBand / figure on Australia pp. 10–11).
 */
export function PageStack({ children, className }: PageStackProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return <div className={`vozes-page-stack${extra}`}>{children}</div>
}
