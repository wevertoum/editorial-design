/** Grupos do levantamento `capa_lemann_levantamento_elementos` (sprite em `assets/media/vozes-grafismo-sprite.svg`). */
export const VOZES_GRAFISMO_GROUPS = {
  g01: {
    label: 'Quadrado roxo + recorte',
    viewBox: '78 398 106 108',
  },
  g02: {
    label: 'Círculo laranja',
    viewBox: '276 78 106 106',
  },
  g03: {
    label: 'Quarto de círculo verde-água',
    viewBox: '572 398 108 108',
  },
  g04: {
    label: 'Faixa modular (4 células)',
    viewBox: '73 246 306 108',
  },
  g05: {
    label: 'Cluster 2×2 (folha + círculos)',
    viewBox: '526 42 212 212',
  },
  g06: {
    label: 'Fileira horizontal (4 células)',
    viewBox: '236 398 262 108',
  },
  g07: {
    label: 'Grade ampla (faixa dupla)',
    viewBox: '76 558 714 214',
  },
  g08: {
    label: 'Losango roxo pequeno',
    /* Recorte do sprite com folga — o rect girado ultrapassa o viewBox 52×52 antigo. */
    viewBox: '88 93 75 75',
  },
  g09: {
    label: 'Coluna vertical modular (faixa lateral)',
    viewBox: '1086.89 42.37 54.79 709.4',
  },
  /** Junção do canto inf. dir. — `SVG/Mesa de trabajo 1 copy 3.svg` (artboard esquerda). */
  resumoJuncao: {
    label: 'Juncão modular canto inf. dir. (resumo p. 9)',
    viewBox: '235 277 496 482',
  },
} as const

export type VozesGrafismoGroupId = keyof typeof VOZES_GRAFISMO_GROUPS

export const VOZES_GRAFISMO_SPRITE = 'media/vozes-grafismo-sprite.svg'