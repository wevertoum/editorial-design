/** Faixa esquerda da capa — 5 faixas iguais, composição da referência editorial. */
export function CoverGrafismoRail() {
  const w = 52.5
  const bands = 5
  const hTotal = 297
  const h = hTotal / bands
  const y2 = h * 2
  const y3 = h * 3
  const y4 = h * 4
  const half = w / 2
  const domeR = 26

  return (
    <svg
      className="cover-grafismo-rail"
      viewBox={`0 0 ${w} ${hTotal}`}
      width={w}
      height={hTotal}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Faixa 2 e 5 — laranja (desenhar antes dos recortes) */}
      <rect x="0" y={h} width={w} height={h} fill="var(--color-vozes-laranja)" />
      <rect x="0" y={y4} width={w} height={h} fill="var(--color-vozes-laranja)" />

      {/* Faixa 1 — roxo + globo + recorte inferior em arco (mostra laranja) */}
      <path
        fill="var(--color-vozes-roxo)"
        d={`M 0 0 H ${w} V ${h} H ${half + domeR} A ${domeR} ${domeR} 0 0 0 ${half - domeR} ${h} H 0 Z`}
      />
      <g transform="translate(5, 8)">
        <circle cx="9.5" cy="9.5" r="9" fill="none" stroke="var(--color-paper)" strokeWidth="1.15" />
        <ellipse cx="9.5" cy="9.5" rx="9" ry="4" fill="none" stroke="var(--color-paper)" strokeWidth="0.95" />
        <ellipse cx="9.5" cy="9.5" rx="3.6" ry="9" fill="none" stroke="var(--color-paper)" strokeWidth="0.95" />
        <line x1="9.5" y1="0.5" x2="9.5" y2="18.5" stroke="var(--color-paper)" strokeWidth="0.85" />
      </g>
      <defs>
        <clipPath id="cover-rail-dome-clip">
          <rect x="0" y={h} width={w} height={h} />
        </clipPath>
        <clipPath id="cover-rail-green-clip">
          <rect x="0" y={y2} width={half} height={h} />
        </clipPath>
      </defs>
      {/* Domo roxo só na faixa laranja */}
      <circle
        cx={half}
        cy={h}
        r={domeR}
        fill="var(--color-vozes-roxo)"
        clipPath="url(#cover-rail-dome-clip)"
      />

      {/* Faixa 3 — metade branca + semicírculo verde | metade roxa */}
      <rect x="0" y={y2} width={half} height={h} fill="var(--color-paper)" />
      <rect x={half} y={y2} width={half} height={h} fill="var(--color-vozes-roxo)" />
      <circle
        cx={half}
        cy={y2 + h / 2}
        r={h * 0.58}
        fill="var(--color-vozes-verde-vivo)"
        clipPath="url(#cover-rail-green-clip)"
      />

      {/* Faixa 4 — lilás + três arcos (grafismo) */}
      <rect x="0" y={y3} width={w} height={h} fill="var(--color-vozes-participation-fill)" />
      {[22, 15.5, 9].map((radius, i) => {
        const yBase = y4 - 4
        return (
          <path
            key={radius}
            d={`M 0 ${yBase} A ${radius} ${radius} 0 0 1 ${radius} ${yBase - radius}`}
            fill="none"
            stroke="var(--color-vozes-roxo)"
            strokeWidth={2.2 - i * 0.26}
          />
        )
      })}
    </svg>
  )
}
