import type { ReactNode } from 'react'
import { MaterialSymbol } from './MaterialSymbol'

type DetailListGridProps = {
  children?: ReactNode
  /** 1 | 2 | 3 colunas (ex.: três financiadores lado a lado). Padrão: 2. */
  columns?: 1 | 2 | 3
  /** narrow ≈ 76% da faixa prosa+rail; full = largura da prosa. Padrão: narrow. */
  width?: 'narrow' | 'full'
  /** Círculo verde — ícone principal (ex.: `payments`). */
  markerLigature?: string
  /** Segundo ícone no mesmo círculo (ex.: `attach_money`). */
  markerLigatureAlt?: string
  className?: string
}

/** Agrupa DetailList com o mesmo ritmo visual do PDF (espaço, largura, título verde). */
export function DetailListGrid({
  children,
  columns = 2,
  width = 'narrow',
  markerLigature,
  markerLigatureAlt,
  className,
}: DetailListGridProps) {
  const colClass =
    columns === 1
      ? 'vozes-detail-list-grid--cols-1'
      : columns === 3
        ? 'vozes-detail-list-grid--cols-3'
        : ''
  const classes = [
    'vozes-detail-list-grid',
    colClass,
    width === 'full' ? 'vozes-detail-list-grid--full' : '',
    className?.trim() ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  const ligature = markerLigature?.trim()
  if (!ligature) {
    return <div className={classes}>{children}</div>
  }

  const ligatureAlt = markerLigatureAlt?.trim()

  const marker = (
    <span className="vozes-detail-list-grid-marker" aria-hidden>
      <MaterialSymbol ligature={ligature} className="vozes-detail-list-grid-marker-glyph" />
      {ligatureAlt ? (
        <MaterialSymbol
          ligature={ligatureAlt}
          className="vozes-detail-list-grid-marker-glyph vozes-detail-list-grid-marker-glyph--alt"
        />
      ) : null}
    </span>
  )

  /* Círculo = coluna 1; cada DetailList = colunas 2–4. */
  if (columns === 3) {
    const fourColClasses = [
      'vozes-detail-list-grid',
      'vozes-detail-list-grid-with-marker',
      'vozes-detail-list-grid-with-marker--four-cols',
      width === 'full' ? 'vozes-detail-list-grid--full' : '',
      className?.trim() ?? '',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <div className={fourColClasses}>
        {marker}
        {children}
      </div>
    )
  }

  return (
    <div className="vozes-detail-list-grid-with-marker vozes-detail-list-grid-with-marker--beside">
      {marker}
      <div className={classes}>{children}</div>
    </div>
  )
}
