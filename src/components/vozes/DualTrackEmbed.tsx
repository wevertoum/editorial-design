import type { DualTrackNode } from '../../content/types'
import { DualTrackTimeline } from './DualTrackTimeline'
import part1a from '../../../content/timelines/australia-cruzamento-1-a.json'
import part1b from '../../../content/timelines/australia-cruzamento-1-b.json'
import part2a from '../../../content/timelines/australia-cruzamento-2-a.json'

const SOURCES = {
  'au-1-a': part1a.nodes as DualTrackNode[],
  'au-1-b': part1b.nodes as DualTrackNode[],
  'au-2-a': part2a.nodes as DualTrackNode[],
} as const

export type DualTrackEmbedPart = keyof typeof SOURCES

type DualTrackEmbedProps = {
  part: DualTrackEmbedPart
  title?: string
  spreadPart?: 'a' | 'b'
  className?: string
}

/**
 * Dual-track cruzamento embutido no capítulo (Austrália: rodapé p. 16 + continuação após marcos).
 * Nós vêm dos JSON de timeline para não duplicar texto.
 */
export function DualTrackEmbed({ part, title, spreadPart, className }: DualTrackEmbedProps) {
  const nodes = SOURCES[part]
  const spread = spreadPart ?? (part === 'au-1-b' ? 'b' : 'a')
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const isStackFoot = extra.includes('vozes-page-stack-foot')
  const reserveTitle = spread === 'b' && isStackFoot

  return (
    <section
      className={`dual-track-section${extra}`}
      data-spread-part={spread}
      aria-label={title?.trim() || 'Onde as trajetórias se cruzam'}
    >
      <DualTrackTimeline
        nodes={nodes}
        spreadPart={spread}
        title={reserveTitle ? undefined : title}
        reserveTitle={reserveTitle}
      />
    </section>
  )
}
