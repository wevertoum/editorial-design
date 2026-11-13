import type { DualTrackNode } from '../../content/types'
import { DualTrackTimeline } from './DualTrackTimeline'
import au1a from '../../../content/timelines/australia-cruzamento-1-a.json'
import au1b from '../../../content/timelines/australia-cruzamento-1-b.json'
import us1a from '../../../content/timelines/usa-cruzamento-1-a.json'
import us1b from '../../../content/timelines/usa-cruzamento-1-b.json'
import eng1a from '../../../content/timelines/england-cruzamento-1-a.json'
import eng1b from '../../../content/timelines/england-cruzamento-1-b.json'
import eng3a from '../../../content/timelines/england-cruzamento-3-a.json'
import eng3b from '../../../content/timelines/england-cruzamento-3-b.json'
import ng1a from '../../../content/timelines/nigeria-cruzamento-1-a.json'
import ng1b from '../../../content/timelines/nigeria-cruzamento-1-b.json'
import cl1a from '../../../content/timelines/chile-cruzamento-1-a.json'
import cl1b from '../../../content/timelines/chile-cruzamento-1-b.json'

export type DualTrackEmbedPart =
  | 'au-1-a'
  | 'au-1-b'
  | 'us-1-a'
  | 'us-1-b'
  | 'eng-1-a'
  | 'eng-1-b'
  | 'eng-3-a'
  | 'eng-3-b'
  | 'ng-1-a'
  | 'ng-1-b'
  | 'cl-1-a'
  | 'cl-1-b'

type EmbedSource = {
  nodes: DualTrackNode[]
  overflowNodes?: DualTrackNode[]
}

function readSource(json: {
  nodes?: DualTrackNode[]
  overflowNodes?: DualTrackNode[]
}): EmbedSource {
  return {
    nodes: (json.nodes ?? []) as DualTrackNode[],
    overflowNodes: json.overflowNodes as DualTrackNode[] | undefined,
  }
}

const SOURCES: Record<DualTrackEmbedPart, EmbedSource> = {
  'au-1-a': readSource(au1a),
  'au-1-b': {
    ...readSource(au1b),
    overflowNodes: (au1b as { overflowNodes?: DualTrackNode[] }).overflowNodes,
  },
  'us-1-a': readSource(us1a),
  'us-1-b': readSource(us1b),
  'eng-1-a': readSource(eng1a),
  'eng-1-b': readSource(eng1b),
  'eng-3-a': readSource(eng3a),
  'eng-3-b': readSource(eng3b),
  'ng-1-a': readSource(ng1a),
  'ng-1-b': readSource(ng1b),
  'cl-1-a': readSource(cl1a),
  'cl-1-b': readSource(cl1b),
}

type DualTrackEmbedProps = {
  part: DualTrackEmbedPart
  title?: string
  spreadPart?: 'a' | 'b'
  className?: string
}

/**
 * Dual-track cruzamento embutido no capítulo org (dupla: rodapé spread A + marcos + spread B).
 * Nós vêm dos JSON de timeline para não duplicar texto.
 */
export function DualTrackEmbed({ part, title, spreadPart, className }: DualTrackEmbedProps) {
  const { nodes, overflowNodes } = SOURCES[part]
  const spread = spreadPart ?? (part.endsWith('-b') ? 'b' : 'a')
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const isStackFoot = extra.includes('vozes-page-stack-foot')
  const reserveTitle = spread === 'b' && isStackFoot
  const hasOverflow = (overflowNodes?.length ?? 0) > 0
  const hasResumo = [...nodes, ...(overflowNodes ?? [])].some((n) => n.resumo?.trim())
  const compactZone = !hasOverflow && nodes.length <= 3 && !hasResumo

  return (
    <section
      className={`dual-track-section${extra}${hasOverflow ? ' dual-track-section--overflow' : ''}${compactZone ? ' dual-track-section--compact-zone' : ''}`}
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
