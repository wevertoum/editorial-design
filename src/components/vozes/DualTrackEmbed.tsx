import type { DualTrackNode } from '../../content/types'
import { DualTrackTimeline } from './DualTrackTimeline'
import part1a from '../../../content/timelines/australia-cruzamento-1-a.json'
import part1b from '../../../content/timelines/australia-cruzamento-1-b.json'

export type DualTrackEmbedPart = 'au-1-a' | 'au-1-b'

type EmbedSource = {
  nodes: DualTrackNode[]
  overflowNodes?: DualTrackNode[]
}

const SOURCES: Record<DualTrackEmbedPart, EmbedSource> = {
  'au-1-a': { nodes: part1a.nodes as DualTrackNode[] },
  'au-1-b': {
    nodes: part1b.nodes as DualTrackNode[],
    overflowNodes: (part1b as { overflowNodes?: DualTrackNode[] }).overflowNodes,
  },
}

type DualTrackEmbedProps = {
  part: DualTrackEmbedPart
  title?: string
  spreadPart?: 'a' | 'b'
  className?: string
}

/**
 * Dual-track cruzamento embutido no capítulo (Austrália: rodapé p. 16 + continuação após marcos).
 * Nós vêm dos JSON de timeline para não duplicar texto.
 * `overflowNodes` na parte B rende uma segunda fileira paralela na mesma faixa marfim (sem folha órfã).
 */
export function DualTrackEmbed({ part, title, spreadPart, className }: DualTrackEmbedProps) {
  const { nodes, overflowNodes } = SOURCES[part]
  const spread = spreadPart ?? (part === 'au-1-b' ? 'b' : 'a')
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const isStackFoot = extra.includes('vozes-page-stack-foot')
  const reserveTitle = spread === 'b' && isStackFoot
  const hasOverflow = (overflowNodes?.length ?? 0) > 0

  return (
    <section
      className={`dual-track-section${extra}${hasOverflow ? ' dual-track-section--overflow' : ''}`}
      data-spread-part={spread}
      aria-label={title?.trim() || 'Onde as trajetórias se cruzam'}
    >
      <DualTrackTimeline
        nodes={nodes}
        overflowNodes={overflowNodes}
        spreadPart={spread}
        title={reserveTitle ? undefined : title}
        reserveTitle={reserveTitle}
      />
    </section>
  )
}
