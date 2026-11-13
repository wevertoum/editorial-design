import type { DualTrackNode } from '../../content/types'
import { renderInlineText } from '../../content/renderRuns'
import { Heading } from '../Heading'

type DualTrackTimelineProps = {
  nodes: DualTrackNode[]
  spreadPart: 'a' | 'b'
  /** Segunda fileira na mesma faixa marfim — colunas alinhadas à fileira principal. */
  overflowNodes?: DualTrackNode[]
  /** Título dentro da faixa marfim (p. esquerda do spread). */
  title?: string
  /** Reserva invisível do mesmo título na p. direita para alinhar o eixo Y. */
  reserveTitle?: boolean
}

type NodeRowProps = {
  nodes: DualTrackNode[]
  columnCount: number
  showTags: boolean
  className?: string
}

function DualTrackNodeRow({ nodes, columnCount, showTags, className }: NodeRowProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const isOverflow = extra.includes('dual-track-nodes--overflow')
  return (
    <ol
      className={`dual-track-nodes${extra}`}
      data-dual-track-row={isOverflow ? 'overflow' : 'primary'}
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {nodes.map((node, index) => (
        <li key={node.id} className="dual-track-node">
          <p className="dual-track-year">{node.year}</p>
          <div className="dual-track-body">
            <p className="dual-track-curriculo">
              {showTags && index === 0 ? (
                <span className="dual-track-tag dual-track-tag--curriculo">Currículo</span>
              ) : null}
              {renderInlineText(node.curriculo)}
            </p>
            <p className="dual-track-organizacao">
              {showTags && index === 0 ? (
                <span className="dual-track-tag dual-track-tag--organizacao">Organização</span>
              ) : null}
              {renderInlineText(node.organizacao)}
            </p>
            {node.resumo?.trim() ? (
              <p className="dual-track-resumo">{renderInlineText(node.resumo.trim())}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function DualTrackTimeline({
  nodes,
  spreadPart,
  overflowNodes,
  title,
  reserveTitle,
}: DualTrackTimelineProps) {
  const hasOverflow = (overflowNodes?.length ?? 0) > 0
  const columnCount = nodes.length
  const showTags = spreadPart === 'a'

  return (
    <div
      className="dual-track"
      data-spread-part={spreadPart}
      data-node-count={nodes.length}
      data-overflow-count={overflowNodes?.length ?? 0}
      data-has-overflow={hasOverflow ? 'true' : undefined}
    >
      <div className="dual-track-band">
        {reserveTitle ? (
          <Heading level={2} className="dual-track-section-title dual-track-reserve" aria-hidden>
            Onde as trajetórias se cruzam
          </Heading>
        ) : title?.trim() ? (
          <Heading level={2} className="dual-track-section-title">
            {title.trim()}
          </Heading>
        ) : null}
        <div className="dual-track-matrix">
          <DualTrackNodeRow
            nodes={nodes}
            columnCount={columnCount}
            showTags={showTags}
            className="dual-track-nodes--primary"
          />
          {hasOverflow ? (
            <DualTrackNodeRow
              nodes={overflowNodes!}
              columnCount={columnCount}
              showTags={false}
              className="dual-track-nodes--overflow"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
