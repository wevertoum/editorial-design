import type { ReactNode } from 'react'

type ParticipationBoxProps = {
  title?: string
  className?: string
  children: ReactNode
}

export function ParticipationBox({ title = 'Canais de participação', className, children }: ParticipationBoxProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return (
    <aside className={`participation-box${extra}`}>
      <svg
        className="participation-box-icon"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        role="presentation"
        focusable="false"
        aria-hidden="true"
      >
        {/* Réplica do vozes-g08 (rect arredondado 45°) — viewBox próprio evita corte no sprite. */}
        <rect
          className="participation-box-icon__shape"
          x="5.25"
          y="5.25"
          width="13.5"
          height="13.5"
          rx="3.75"
          ry="3.75"
          transform="rotate(45 12 12)"
        />
      </svg>
      <div className="participation-box-inner">
        <p className="participation-box-title">{title}</p>
        <div className="participation-box-body">{children}</div>
      </div>
    </aside>
  )
}
