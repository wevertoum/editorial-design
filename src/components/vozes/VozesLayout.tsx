import type { ReactNode } from 'react'

type VozesLayoutProps = {
  className?: string
  children: ReactNode
}

export function VozesLayout({ className, children }: VozesLayoutProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return <div className={`vozes-page${extra}`}>{children}</div>
}

export function VozesMain({ children }: { children: ReactNode }) {
  return <div className="vozes-main">{children}</div>
}

export function VozesRail({ children }: { children: ReactNode }) {
  return <aside className="vozes-rail">{children}</aside>
}
