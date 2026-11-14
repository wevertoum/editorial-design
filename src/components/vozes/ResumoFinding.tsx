import type { ReactNode } from 'react'

type ResumoFindingGridProps = {
  children: ReactNode
}

export function ResumoFindingGrid({ children }: ResumoFindingGridProps) {
  return <div className="resumo-finding-grid">{children}</div>
}

type ResumoFindingProps = {
  number: number | string
  title: string
  children: ReactNode
}

/** Achado numerado do resumo executivo: cifra fora + caixa (título org + corpo). */
export function ResumoFinding({ number, title, children }: ResumoFindingProps) {
  const toneKey = String(number).replace(/\s+/g, '')
  const toneClass = /^\d+$/.test(toneKey) ? `resumo-finding--${toneKey}` : undefined

  return (
    <article className={['resumo-finding', toneClass].filter(Boolean).join(' ')}>
      <span className="resumo-finding-number" aria-hidden="true">
        {number}
      </span>
      <div className="resumo-finding-box">
        <p className="resumo-finding-title">{title}</p>
        <div className="resumo-finding-body">{children}</div>
      </div>
    </article>
  )
}