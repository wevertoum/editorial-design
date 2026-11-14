import type { ReactNode } from 'react'
import { MaterialSymbol } from './MaterialSymbol'

export type DetailListIcon = 'structure' | 'write' | 'implement' | 'monitor'

type DetailListProps = {
  children: ReactNode
  /** Marcador editorial no lugar do bullet verde (fases do currículo AU). */
  icon?: DetailListIcon
  /** Quando false (ex.: *A atuação*), só título + corpo, sem losango. Padrão: true. */
  bullet?: boolean
}

/** Ícones semânticos → Material Symbols Outlined. */
const MATERIAL_LIGATURES: Record<DetailListIcon, string> = {
  structure: 'schema',
  write: 'edit_note',
  implement: 'domain',
  monitor: 'monitoring',
}

function DetailIconMark({ name }: { name: DetailListIcon }) {
  return <MaterialSymbol ligature={MATERIAL_LIGATURES[name]} className="detail-list-icon" />
}

export function DetailList({ children, icon, bullet = true }: DetailListProps) {
  /* `div` — MDX coloca parágrafos dentro; `<p>` quebrava o alinhamento do marcador no PDF. */
  const iconClass = icon ? ' detail-list-item--icon' : ''
  const bulletClass = bullet === false ? ' detail-list-item--no-bullet' : ''
  return (
    <div className={`detail-list-item${iconClass}${bulletClass}`}>
      {icon ? <DetailIconMark name={icon} /> : null}
      {children}
    </div>
  )
}
