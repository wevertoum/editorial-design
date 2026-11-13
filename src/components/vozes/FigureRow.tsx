import type { ReactNode } from 'react'

type FigureRowProps = {
  children: ReactNode
  className?: string
}

/** Agrupa figuras lado a lado no fluxo do corpo (sem min-height de PageStack). */
export function FigureRow({ children, className }: FigureRowProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return <div className={`vozes-figure-row${extra}`}>{children}</div>
}
