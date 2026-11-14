import type { CSSProperties } from 'react'

const MARKER_TONES = [
  'var(--color-vozes-roxo)',
  'var(--color-vozes-sumario-lime)',
  'var(--color-vozes-laranja)',
  'var(--org-hierarchy-icon-tone-2)',
] as const

type ActorBandMarkerProps = {
  index: number
  className?: string
}

/**
 * Quarto de círculo do levantamento — topo e direita retos, curva no canto oposto.
 * Rotação variada por coluna (0° / 90° / 180° / 270°), como na referência.
 */
export function ActorBandMarker({ index, className }: ActorBandMarkerProps) {
  const fill = MARKER_TONES[index % MARKER_TONES.length]
  const rotateDeg = (index % 4) * 90
  const extra = className?.trim() ? ` ${className.trim()}` : ''

  return (
    <span
      className={`actor-band-marker${extra}`}
      style={
        {
          '--actor-band-marker-fill': fill,
          '--actor-band-marker-rotate': `${rotateDeg}deg`,
        } as CSSProperties
      }
      aria-hidden
    >
      <span className="actor-band-marker-shape" />
    </span>
  )
}