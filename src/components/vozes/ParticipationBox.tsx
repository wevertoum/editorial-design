import type { ReactNode } from 'react'
import { MaterialSymbol } from './MaterialSymbol'

type ParticipationBoxProps = {
  title?: string
  className?: string
  children: ReactNode
}

export function ParticipationBox({ title = 'Canais de participação', className, children }: ParticipationBoxProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  return (
    <aside className={`participation-box${extra}`}>
      <MaterialSymbol ligature="forum" className="participation-box-icon" />
      <div className="participation-box-inner">
        <p className="participation-box-title">{title}</p>
        <div className="participation-box-body">{children}</div>
      </div>
    </aside>
  )
}
