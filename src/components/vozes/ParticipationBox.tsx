import type { ReactNode } from 'react'

type ParticipationBoxProps = {
  title?: string
  className?: string
  children: ReactNode
}

function ParticipationGlobeIcon() {
  return (
    <span className="participation-box-icon" aria-hidden="true">
      <svg
        viewBox="0 0 20 20"
        width="100%"
        height="100%"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10" cy="10" r="7.2" />
        <path d="M2.8 10h14.4" />
        <path d="M10 2.8c2.4 2.1 3.8 4.6 3.8 7.2s-1.4 5.1-3.8 7.2" />
        <path d="M10 2.8C7.6 4.9 6.2 7.4 6.2 10s1.4 5.1 3.8 7.2" />
      </svg>
    </span>
  )
}

export function ParticipationBox({ title = 'Canais de participação', className, children }: ParticipationBoxProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return (
    <aside className={`participation-box${extra}`}>
      <ParticipationGlobeIcon />
      <div className="participation-box-inner">
        <p className="participation-box-title">{title}</p>
        <div className="participation-box-body">{children}</div>
      </div>
    </aside>
  )
}
