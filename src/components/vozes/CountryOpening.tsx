import { VOZES_GRAFISMO_SPRITE } from './grafismo/catalog'

type CountryOpeningProps = {
  code: string
  title: string
  lead?: string
}

/** Três células de `vozes-g04` (faixa modular do levantamento). */
const COUNTRY_FAIXA_VIEWBOX = '73 246 229.5 108'
const COUNTRY_FAIXA_SPRITE_ID = 'vozes-g04'

export function CountryOpening({ code, title, lead }: CountryOpeningProps) {
  const leadText = lead?.trim() ?? ''
  const normalized = code.trim().toUpperCase()

  return (
    <header className="country-opening">
      <div className="country-opening__title-row">
        <span className="country-opening__faixa-anchor" aria-hidden="true">
          <span className="country-opening__faixa">
            <svg
              className="country-opening__faixa-svg"
              viewBox={COUNTRY_FAIXA_VIEWBOX}
              preserveAspectRatio="xMidYMid meet"
              role="presentation"
              focusable="false"
            >
              <use href={`${VOZES_GRAFISMO_SPRITE}#${COUNTRY_FAIXA_SPRITE_ID}`} />
            </svg>
          </span>
        </span>
        <h1>{title}</h1>
        <span className="country-code-sr">{normalized}</span>
      </div>
      {leadText ? <p className="country-lead">{leadText}</p> : null}
    </header>
  )
}