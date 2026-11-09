export type OutputProfile = 'screen' | 'digital' | 'print'

export function resolveProfile(mode: string): OutputProfile {
  if (mode === 'print') return 'print'
  if (mode === 'digital' || mode === 'production') return 'digital'
  return 'screen'
}
