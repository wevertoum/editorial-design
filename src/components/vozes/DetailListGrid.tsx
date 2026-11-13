import type { ReactNode } from 'react'

type DetailListGridProps = {
  children?: ReactNode
  /** 2 = grelha 2 colunas (ex. financiamento); 1 = coluna única (exemplos longos). Padrão: 2. */
  columns?: 1 | 2
  /** narrow ≈ 76% da faixa prosa+rail; full = largura da prosa. Padrão: narrow. */
  width?: 'narrow' | 'full'
}

/** Agrupa DetailList com o mesmo ritmo visual do PDF (espaço, largura, título verde). */
export function DetailListGrid({ children, columns = 2, width = 'narrow' }: DetailListGridProps) {
  const classes = [
    'vozes-detail-list-grid',
    columns === 1 ? 'vozes-detail-list-grid--cols-1' : '',
    width === 'full' ? 'vozes-detail-list-grid--full' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return <div className={classes}>{children}</div>
}
