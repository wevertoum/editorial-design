/** Folhas que exibem a etiqueta «em desenvolvimento» (prévia e PDF). Vazio = desligado. */
export const DEVELOPMENT_LABEL_SECTION_IDS = new Set<string>([])

export function sectionHasDevelopmentLabel(sectionId: string): boolean {
  return DEVELOPMENT_LABEL_SECTION_IDS.has(sectionId)
}
