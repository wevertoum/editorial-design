import type { ReactNode } from 'react'

export type DetailListIcon = 'structure' | 'write' | 'implement' | 'monitor'

type DetailListProps = {
  children: ReactNode
  /** Optional editorial marker; replaces the green bullet. */
  icon?: DetailListIcon
}

const ICON_PATHS: Record<DetailListIcon, ReactNode> = {
  /* Camadas / estrutura do documento */
  structure: (
    <>
      <path d="M3.5 6.2 10 3.5 16.5 6.2 10 8.9Z" />
      <path d="M3.5 10.2 10 12.9 16.5 10.2" />
      <path d="M3.5 13.8 10 16.5 16.5 13.8" />
    </>
  ),
  /* Lápis */
  write: (
    <>
      <path d="M4 16.5 14.2 6.3a1.55 1.55 0 0 1 2.2 2.2L6.2 18.8 3 19.5z" />
      <path d="M12.7 7.8 15.7 10.8" />
    </>
  ),
  /* Caixa com check — implementar */
  implement: (
    <>
      <rect x="3.4" y="3.4" width="13.2" height="13.2" rx="1.3" />
      <path d="M6.8 10.4 9.3 12.9 13.5 7.9" />
    </>
  ),
  /* Ciclo de revisão */
  monitor: (
    <>
      <path d="M15.2 8.2A5.4 5.4 0 1 0 14.8 13.4" />
      <path d="M15.4 4.6 15.2 8.2 11.6 8" />
    </>
  ),
}

function DetailIconMark({ name }: { name: DetailListIcon }) {
  return (
    <span className="detail-list-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {ICON_PATHS[name]}
      </svg>
    </span>
  )
}

export function DetailList({ children, icon }: DetailListProps) {
  /* `div` — MDX coloca parágrafos dentro; `<p>` quebrava o marcador no Vivliostyle. */
  const iconClass = icon ? ' detail-list-item--icon' : ''
  return (
    <div className={`detail-list-item${iconClass}`}>
      {icon ? <DetailIconMark name={icon} /> : null}
      {children}
    </div>
  )
}
