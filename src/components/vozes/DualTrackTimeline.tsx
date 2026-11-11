import type { DualTrackNode } from '../../content/types'

type DualTrackTimelineProps = {
  nodes: DualTrackNode[]
  spreadPart: 'a' | 'b'
}

export function DualTrackTimeline({ nodes, spreadPart }: DualTrackTimelineProps) {
  return (
    <div className="dual-track" data-spread-part={spreadPart}>
      <div className="dual-track-band">
        <div className="dual-track-tracks" aria-hidden="true">
          <span className="dual-track-tag dual-track-tag--curriculo">Currículo</span>
          <span className="dual-track-axis" />
          <span className="dual-track-tag dual-track-tag--organizacao">Organização</span>
        </div>
        <ol className="dual-track-nodes">
          {nodes.map((node) => (
            <li key={node.id} className="dual-track-node">
              <p className="dual-track-year">{node.year}</p>
              <p className="dual-track-curriculo">{node.curriculo}</p>
              <p className="dual-track-organizacao">{node.organizacao}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
