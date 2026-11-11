import type { ReactNode } from 'react'

export function DetailList({ children }: { children: ReactNode }) {
  return <p className="detail-list-item">{children}</p>
}
