import type { ReactNode } from 'react'

export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <footer className="source-note">
      <p>{children}</p>
    </footer>
  )
}
