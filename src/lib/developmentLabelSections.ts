/** Folhas que exibem a etiqueta «em desenvolvimento» (prévia e PDF). */
export const DEVELOPMENT_LABEL_SECTION_IDS = new Set([
  'capa',
  'expediente',
  'folha-de-rosto',
  'sumario',
  'apresentacao',
  'resumo-executivo',
])

export function sectionHasDevelopmentLabel(sectionId: string): boolean {
  return DEVELOPMENT_LABEL_SECTION_IDS.has(sectionId)
}
