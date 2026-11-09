export function assetUrl(src: string): string {
  if (/^(https?:|data:)/.test(src)) return src
  const clean = src.replace(/^\.?\//, '')
  return `${import.meta.env.BASE_URL}${clean}`
}
