import { VOZES_GRAFISMO_GROUPS, VOZES_GRAFISMO_SPRITE, type VozesGrafismoGroupId } from './grafismo/catalog'

type VozesGrafismoProps = {
  /** Folio global do PDF (número na margem). Não entra no fluxo nem na medição de quebra. */
  folio: number
  group: VozesGrafismoGroupId
  /** Tamanho do desenho (quadrado de referência). */
  size?: string
  top?: string
  right?: string
  bottom?: string
  left?: string
  rotate?: number
  flipH?: boolean
  /** Paletas derivadas do levantamento (sem alterar grupos padrão). */
  tone?: 'sumario-lime' | 'sumario-roxo' | 'verde-roxo'
  className?: string
}

function grafismoSpriteId(group: VozesGrafismoGroupId, tone?: VozesGrafismoProps['tone']): string {
  if (tone === 'sumario-lime' && group === 'g05') return 'vozes-g05-sumario-lime'
  if (tone === 'sumario-roxo' && group === 'g05') return 'vozes-g05-sumario-roxo'
  if (tone === 'verde-roxo' && group === 'g01') return 'vozes-g01-verde-roxo'
  return `vozes-${group}`
}

/**
 * Grafismo de marca — camada absoluta, ancorada ao folio após paginação.
 * Não altera altura do miolo nem desloca texto entre folhas.
 */
export function VozesGrafismo({
  folio,
  group,
  size = '20mm',
  top,
  right,
  bottom,
  left,
  rotate = 0,
  flipH = false,
  tone,
  className,
}: VozesGrafismoProps) {
  const spec = VOZES_GRAFISMO_GROUPS[group]
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const transformParts = [
    flipH ? 'scaleX(-1)' : '',
    rotate ? `rotate(${rotate}deg)` : '',
  ].filter(Boolean)
  const hostStyle = {
    top,
    right,
    bottom,
    left,
    width: size,
    height: size,
    transform: transformParts.length > 0 ? transformParts.join(' ') : undefined,
    transformOrigin: flipH || rotate ? 'center center' : undefined,
  }

  return (
    <div
      className={`vozes-grafismo-host${extra}`}
      data-folio={String(folio)}
      data-group={group}
      aria-hidden="true"
      style={hostStyle}
    >
      <svg
        className="vozes-grafismo__svg"
        viewBox={spec.viewBox}
        role="presentation"
        focusable="false"
      >
        <use href={`${VOZES_GRAFISMO_SPRITE}#${grafismoSpriteId(group, tone)}`} />
      </svg>
    </div>
  )
}