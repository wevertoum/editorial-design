import type { ReactNode } from 'react'

export function Columns({ children }: { children?: ReactNode }) {
  return <div className="text-columns">{children}</div>
}
