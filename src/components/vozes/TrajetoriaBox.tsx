import type { ReactNode } from 'react'

type TrajetoriaBoxProps = {
  children: ReactNode
  className?: string
}

/** Envolves «A trajetória do currículo» / «A trajetória da organização» (+ marcos ou intro). */
export function TrajetoriaBox({ children, className }: TrajetoriaBoxProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return <div className={`trajetoria-box${extra}`}>{children}</div>
}
