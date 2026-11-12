import type { ReactElement } from 'react'

type CountryOpeningProps = {
  code: string
  title: string
  lead?: string
}

type FlagProps = { className?: string }

/** Flags stay inline, fills only (no stroke). External SVG in img fails when the PDF is printed. */

function AustraliaFlag({ className }: FlagProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="30" height="15" aria-hidden="true" focusable="false">
      <rect width="60" height="30" fill="#012169" />
      <polygon points="0,0 3.2,0 30,12.2 30,15 26.8,15 0,2.8" fill="#fff" />
      <polygon points="30,0 30,2.8 3.2,15 0,15 0,12.2 26.8,0" fill="#fff" />
      <polygon points="0,0 1.6,0 30,13.1 30,15 28.4,15 0,1.9" fill="#C8102E" />
      <polygon points="30,0 30,1.9 1.6,15 0,15 0,13.1 28.4,0" fill="#C8102E" />
      <rect x="11.5" y="0" width="7" height="15" fill="#fff" />
      <rect x="0" y="4" width="30" height="7" fill="#fff" />
      <rect x="13" y="0" width="4" height="15" fill="#C8102E" />
      <rect x="0" y="5.5" width="30" height="4" fill="#C8102E" />
      <g fill="#fff" transform="translate(15 22.5)">
        <path d="M0-3.2 L0.72-0.99 L3.04-0.99 L1.16 0.38 L1.88 2.59 L0 1.22 L-1.88 2.59 L-1.16 0.38 L-3.04-0.99 L-0.72-0.99 Z" />
      </g>
      <g fill="#fff">
        <path transform="translate(45 5.2) scale(0.55)" d="M0-3.2 L0.72-0.99 L3.04-0.99 L1.16 0.38 L1.88 2.59 L0 1.22 L-1.88 2.59 L-1.16 0.38 L-3.04-0.99 L-0.72-0.99 Z" />
        <path transform="translate(52 10.5) scale(0.5)" d="M0-3.2 L0.72-0.99 L3.04-0.99 L1.16 0.38 L1.88 2.59 L0 1.22 L-1.88 2.59 L-1.16 0.38 L-3.04-0.99 L-0.72-0.99 Z" />
        <path transform="translate(50.5 18.2) scale(0.55)" d="M0-3.2 L0.72-0.99 L3.04-0.99 L1.16 0.38 L1.88 2.59 L0 1.22 L-1.88 2.59 L-1.16 0.38 L-3.04-0.99 L-0.72-0.99 Z" />
        <path transform="translate(42.5 15.5) scale(0.48)" d="M0-3.2 L0.72-0.99 L3.04-0.99 L1.16 0.38 L1.88 2.59 L0 1.22 L-1.88 2.59 L-1.16 0.38 L-3.04-0.99 L-0.72-0.99 Z" />
        <path transform="translate(46.8 12.2) scale(0.28)" d="M0-3.2 L0.72-0.99 L3.04-0.99 L1.16 0.38 L1.88 2.59 L0 1.22 L-1.88 2.59 L-1.16 0.38 L-3.04-0.99 L-0.72-0.99 Z" />
      </g>
    </svg>
  )
}

function UnitedStatesFlag({ className }: FlagProps) {
  const stripes = Array.from({ length: 13 }, (_, i) => (
    <rect key={i} y={i * (30 / 13)} width="60" height={30 / 13} fill={i % 2 === 0 ? '#B22234' : '#fff'} />
  ))
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="30" height="15" aria-hidden="true" focusable="false">
      {stripes}
      <rect width="24" height={(30 / 13) * 7} fill="#3C3B6E" />
      {/* Simplified star field for tiny print */}
      {[
        [3, 2.2], [7.5, 2.2], [12, 2.2], [16.5, 2.2], [21, 2.2],
        [5.25, 4.6], [9.75, 4.6], [14.25, 4.6], [18.75, 4.6],
        [3, 7], [7.5, 7], [12, 7], [16.5, 7], [21, 7],
        [5.25, 9.4], [9.75, 9.4], [14.25, 9.4], [18.75, 9.4],
        [3, 11.8], [7.5, 11.8], [12, 11.8], [16.5, 11.8], [21, 11.8],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.85" fill="#fff" />
      ))}
    </svg>
  )
}

function UnitedKingdomFlag({ className }: FlagProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="30" height="15" aria-hidden="true" focusable="false">
      <rect width="60" height="30" fill="#012169" />
      <polygon points="0,0 6.4,0 60,24.4 60,30 53.6,30 0,5.6" fill="#fff" />
      <polygon points="60,0 60,5.6 6.4,30 0,30 0,24.4 53.6,0" fill="#fff" />
      <polygon points="0,0 3.2,0 60,26.2 60,30 56.8,30 0,3.8" fill="#C8102E" />
      <polygon points="60,0 60,3.8 3.2,30 0,30 0,26.2 56.8,0" fill="#C8102E" />
      <rect x="24" y="0" width="12" height="30" fill="#fff" />
      <rect x="0" y="9" width="60" height="12" fill="#fff" />
      <rect x="26.5" y="0" width="7" height="30" fill="#C8102E" />
      <rect x="0" y="11.5" width="60" height="7" fill="#C8102E" />
    </svg>
  )
}

function NigeriaFlag({ className }: FlagProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="30" height="15" aria-hidden="true" focusable="false">
      <rect width="20" height="30" fill="#008751" />
      <rect x="20" width="20" height="30" fill="#fff" />
      <rect x="40" width="20" height="30" fill="#008751" />
    </svg>
  )
}

function ChileFlag({ className }: FlagProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="30" height="15" aria-hidden="true" focusable="false">
      <rect width="60" height="15" fill="#fff" />
      <rect y="15" width="60" height="15" fill="#D52B1E" />
      <rect width="20" height="15" fill="#0039A6" />
      <path
        fill="#fff"
        transform="translate(10 7.5) scale(0.7)"
        d="M0-3.2 L0.72-0.99 L3.04-0.99 L1.16 0.38 L1.88 2.59 L0 1.22 L-1.88 2.59 L-1.16 0.38 L-3.04-0.99 L-0.72-0.99 Z"
      />
    </svg>
  )
}

const COUNTRY_FLAG_COMPONENTS: Record<string, (props: FlagProps) => ReactElement> = {
  AU: AustraliaFlag,
  US: UnitedStatesFlag,
  GB: UnitedKingdomFlag,
  UK: UnitedKingdomFlag,
  NG: NigeriaFlag,
  CL: ChileFlag,
}

export function CountryOpening({ code, title, lead }: CountryOpeningProps) {
  const leadText = lead?.trim() ?? ''
  const normalized = code.trim().toUpperCase()
  const Flag = COUNTRY_FLAG_COMPONENTS[normalized]

  return (
    <header className="country-opening">
      {Flag ? (
        <p className="country-code country-code--flag">
          <Flag className="country-flag" />
          <span className="country-code-sr">{normalized}</span>
        </p>
      ) : (
        <p className="country-code">{code}</p>
      )}
      <h1>{title}</h1>
      {leadText ? <p className="country-lead">{leadText}</p> : null}
    </header>
  )
}
