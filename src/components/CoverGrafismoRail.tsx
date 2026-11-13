/** Faixa vertical de grafismos (8 ladrilhos) — paleta Vozes, vetorial para tela e PDF. */
export function CoverGrafismoRail() {
  const h = 37.125
  const w = 50

  return (
    <svg
      className="cover-grafismo-rail"
      viewBox={`0 0 ${w} ${h * 8}`}
      width={w}
      height={h * 8}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {Array.from({ length: 8 }, (_, i) => (
          <clipPath key={i} id={`cover-tile-clip-${i}`}>
            <rect x="0" y={i * h} width={w} height={h} />
          </clipPath>
        ))}
      </defs>

      {/* 1 — quartos de círculo */}
      <g clipPath="url(#cover-tile-clip-0)">
        <rect x="0" y="0" width={w} height={h} fill="var(--color-vozes-roxo)" />
        <circle cx="0" cy="0" r="34" fill="var(--color-vozes-laranja)" />
        <circle cx={w} cy={h} r="36" fill="var(--color-marfim)" />
      </g>

      {/* 2 — globo */}
      <g clipPath="url(#cover-tile-clip-1)">
        <rect x="0" y={h} width={w} height={h} fill="var(--color-vozes-roxo)" />
        <circle cx={w / 2} cy={h + h / 2} r="14" fill="none" stroke="var(--color-paper)" strokeWidth="1.35" />
        <ellipse
          cx={w / 2}
          cy={h + h / 2}
          rx="14"
          ry="6.5"
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="1.2"
        />
        <ellipse
          cx={w / 2}
          cy={h + h / 2}
          rx="6"
          ry="14"
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="1.2"
        />
        <line
          x1={w / 2}
          y1={h + h / 2 - 14}
          x2={w / 2}
          y2={h + h / 2 + 14}
          stroke="var(--color-paper)"
          strokeWidth="1.1"
        />
      </g>

      {/* 3 — círculo grande */}
      <g clipPath="url(#cover-tile-clip-2)">
        <rect x="0" y={h * 2} width={w} height={h} fill="var(--color-vozes-roxo)" />
        <circle cx={w / 2} cy={h * 2 + h / 2 + 4} r="30" fill="var(--color-vozes-laranja)" />
      </g>

      {/* 4 — estrela de quatro pontas */}
      <g clipPath="url(#cover-tile-clip-3)">
        <rect x="0" y={h * 3} width={w} height={h} fill="var(--color-vozes-roxo)" />
        <path
          fill="var(--color-paper)"
          d={`M ${w / 2} ${h * 3 + 10}
            Q ${w / 2 + 9} ${h * 3 + 16} ${w - 8} ${h * 3 + h / 2}
            Q ${w / 2 + 9} ${h * 3 + h - 16} ${w / 2} ${h * 3 + h - 10}
            Q ${w / 2 - 9} ${h * 3 + h - 16} 8 ${h * 3 + h / 2}
            Q ${w / 2 - 9} ${h * 3 + 16} ${w / 2} ${h * 3 + 10} Z`}
        />
      </g>

      {/* 5 — meio círculo em marfim */}
      <g clipPath="url(#cover-tile-clip-4)">
        <rect x="0" y={h * 4} width={w} height={h} fill="var(--color-marfim)" />
        <circle cx={w / 2} cy={h * 5} r="26" fill="var(--color-vozes-laranja)" />
      </g>

      {/* 6 — arcos concêntricos */}
      <g clipPath="url(#cover-tile-clip-5)">
        <rect x="0" y={h * 5} width={w} height={h} fill="var(--color-marfim)" />
        {[22, 17, 12].map((radius, i) => (
          <path
            key={radius}
            d={`M ${w / 2 - radius} ${h * 5 + h - 2} A ${radius} ${radius} 0 0 1 ${w / 2 + radius} ${h * 5 + h - 2}`}
            fill="none"
            stroke="var(--color-vozes-roxo)"
            strokeWidth={2.6 - i * 0.35}
          />
        ))}
      </g>

      {/* 7 — semicírculo superior */}
      <g clipPath="url(#cover-tile-clip-6)">
        <rect x="0" y={h * 6} width={w} height={h} fill="var(--color-vozes-roxo)" />
        <circle cx={w / 2} cy={h * 6} r="24" fill="var(--color-vozes-laranja)" />
      </g>

      {/* 8 — quarto de círculo + fatia */}
      <g clipPath="url(#cover-tile-clip-7)">
        <rect x="0" y={h * 7} width={w} height={h} fill="var(--color-vozes-roxo)" />
        <circle cx={w} cy={h * 8} r="30" fill="var(--color-marfim)" />
        <circle cx={w - 6} cy={h * 8 - 4} r="16" fill="var(--color-vozes-laranja)" />
      </g>
    </svg>
  )
}
