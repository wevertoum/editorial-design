import type { DualTrackNode } from '../../content/types'
import { renderInlineText } from '../../content/renderRuns'

type DualTrackTimelineProps = {
  nodes: DualTrackNode[]
  spreadPart: 'a' | 'b'
}

export function DualTrackTimeline({ nodes, spreadPart }: DualTrackTimelineProps) {
  return (
    <div className="dual-track" data-spread-part={spreadPart} data-node-count={nodes.length}>
      <div className="dual-track-band">
        <ol
          className="dual-track-nodes"
          style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}
        >
          {nodes.map((node) => (
            <li key={node.id} className="dual-track-node">
              <p className="dual-track-year">{node.year}</p>
              <div className="dual-track-body">
                <p className="dual-track-curriculo">
                  <span className="dual-track-tag dual-track-tag--curriculo">Currículo</span>
                  {renderInlineText(node.curriculo)}
                </p>
                <p className="dual-track-organizacao">
                  <span className="dual-track-tag dual-track-tag--organizacao">Organização</span>
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
