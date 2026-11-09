import { readFileSync } from 'node:fs'

export const REQUIRED_TOKENS = [
  '--page-width',
  '--page-height',
  '--margin-top',
  '--margin-bottom',
  '--margin-inner',
  '--margin-outer',
  '--bleed',
  '--font-serif',
  '--font-sans',
  '--color-ink',
  '--color-paper',
  '--color-accent',
  '--column-gap',
] as const

const lengthPattern = /^\d+(\.\d+)?(mm|cm|in|pt|px)$/

export function readText(file: string): string {
  return readFileSync(file, 'utf8')
}

export function readCustomProperty(css: string, name: string, file: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*:\\s*([^;]+);`))
  if (!match?.[1]) {
    throw new Error(`${file} is missing ${name}`)
  }
  return match[1].trim()
}

export function assertDesignTokens(css: string, file: string): void {
  for (const token of REQUIRED_TOKENS) {
    readCustomProperty(css, token, file)
  }
}

export function assertLength(value: string, file: string, name: string): string {
  const normalized = value.replace(/\s+/g, '')
  if (!lengthPattern.test(normalized)) {
    throw new Error(`${file} ${name} must be a CSS length such as 3mm, got "${value}"`)
  }
  return normalized
}
