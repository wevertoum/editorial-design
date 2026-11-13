import type { DualTrackNode } from '../../content/types'
import { renderInlineText } from '../../content/renderRuns'
import { Heading } from '../Heading'

type DualTrackTimelineProps = {
  nodes: DualTrackNode[]
  spreadPart: 'a' | 'b'
  /** Título dentro da faixa marfim (p. esquerda do spread). */
  title?: string
  /** Reserva invisível do mesmo título na p. direita para alinhar o eixo Y. */
  reserveTitle?: boolean
}

export function DualTrackTimeline({ nodes, spreadPart, title, reserveTitle }: DualTrackTimelineProps) {
  return (
    <div className="dual-track" data-spread-part={spreadPart} data-node-count={nodes.length}>
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
        <ol
          className="dual-track-nodes"
          style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}
        >
          {nodes.map((node, index) => (
            <li key={node.id} className="dual-track-node">
              <p className="dual-track-year">{node.year}</p>
              <div className="dual-track-body">
                <p className="dual-track-curriculo">
                  {spreadPart === 'a' && index === 0 ? (
                    <span className="dual-track-tag dual-track-tag--curriculo">Currículo</span>
                  ) : null}
                  {renderInlineText(node.curriculo)}
                </p>
                <p className="dual-track-organizacao">
                  {spreadPart === 'a' && index === 0 ? (
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
      </div>
    </div>
  )
}
