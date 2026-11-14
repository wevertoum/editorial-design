import { VOZES_GRAFISMO_GROUPS, VOZES_GRAFISMO_SPRITE } from './grafismo/catalog'

/** Coluna vertical de grafismos (sprite g09) — f. 6, fora do fluxo, com sangria. */
export function VozesElementosFaixa() {
  const spec = VOZES_GRAFISMO_GROUPS.g09
  return (
    <div className="vozes-elementos-coluna-host" aria-hidden="true">
      <svg
        className="vozes-elementos-coluna__svg"
        viewBox={spec.viewBox}
        role="presentation"
        focusable="false"
      >
        <use href={`${VOZES_GRAFISMO_SPRITE}#vozes-g09`} />
      </svg>
    </div>
  )
}