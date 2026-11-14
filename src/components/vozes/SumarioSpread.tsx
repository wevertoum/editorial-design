import type { DualTrackNode } from '../../content/types'
import { renderInlineText } from '../../content/renderRuns'
import spreadA from '../../../content/timelines/sumario-spread-a.json'
import spreadB from '../../../content/timelines/sumario-spread-b.json'

type SumarioSpreadProps = {
  part: 'a' | 'b'
}

type SumarioChild = Pick<DualTrackNode, 'id' | 'year' | 'curriculo' | 'organizacao'>

type SumarioNode = DualTrackNode & {
  tier?: 'main' | 'sub'
  children?: SumarioChild[]
}

type NodeRowProps = {
  nodes: SumarioNode[]
}

function SumarioNodeRow({ nodes }: NodeRowProps) {
  const columnCount = nodes.length
  return (
    <ol
      className="dual-track-nodes dual-track-nodes--primary"
      data-dual-track-row="primary"
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {nodes.map((node) => (
        <li key={node.id} className="dual-track-node sumario-entry--main">
          <p className="dual-track-year">{node.year}</p>
          <div className="dual-track-body">
            <p className="dual-track-curriculo sumario-spread-label sumario-spread-label--main">
              {renderInlineText(node.curriculo)}
            </p>
            {node.children && node.children.length > 0 ? (
              <div className="sumario-org-stack">
                {node.children.map((child) => (
                  <div key={child.id} className="sumario-org-entry">
                    <p className="sumario-org-page">{child.year}</p>
                    <p className="sumario-org-label">{renderInlineText(child.curriculo)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

function readNodes(json: { nodes?: SumarioNode[] }) {
  return (json.nodes ?? []) as SumarioNode[]
}

/** Sumário em dupla: eixo só com entradas principais; organizações sob o país. */
export function SumarioSpread({ part }: SumarioSpreadProps) {
  const nodes = part === 'a' ? readNodes(spreadA) : readNodes(spreadB)
  const mainCount = nodes.length

  return (
    <section className="dual-track-section vozes-sumario-track" data-spread-part={part} aria-label="Sumário">
      <div
        className="dual-track vozes-sumario-dual-track"
        data-spread-part={part}
        data-node-count={mainCount}
        data-overflow-count="0"
      >
        <div className="dual-track-band">
          <div className="dual-track-matrix">
            <SumarioNodeRow nodes={nodes} />
          </div>
        </div>
      </div>
    </section>
  )
}