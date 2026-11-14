import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'

export type MediaBox = [number, number, number, number]

export type PdfReport = {
  bytes: number
  pageCount: number
  pageCountSource: string
  mediaBoxes: MediaBox[]
  fonts: string[]
}

import { A4_HEIGHT_PT, A4_WIDTH_PT, SPREAD_WIDTH_PT } from './join-pdf-spreads'

const SPREAD_HEIGHT_PT = A4_HEIGHT_PT
const TOLERANCE_PT = 8

export function inspectPdf(file: string): PdfReport {
  const data = readFileSync(file)
  const text = data.toString('latin1')
  const pageObjects = text.match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0
  const info = readPdfInfo(file)
  const infoPages = info ? Number(info.match(/^Pages:\s+(\d+)/m)?.[1]) : Number.NaN

  let pageCount = 0
  let pageCountSource = 'unresolved'
  if (Number.isFinite(infoPages) && infoPages > 0) {
    pageCount = infoPages
    pageCountSource = 'pdfinfo'
  } else if (pageObjects > 0) {
    pageCount = pageObjects
    pageCountSource = 'page-objects'
  }

  const mediaBoxes = [
    ...text.matchAll(
      /\/MediaBox\s*\[\s*(-?[0-9.]+)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s+(-?[0-9.]+)\s*\]/g,
    ),
  ].map((match) => [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])] as MediaBox)

  const fonts = [
    ...new Set([...text.matchAll(/\/BaseFont\s*\/([^\s[\]<>/]+)/g)].map((match) => match[1])),
  ]

  return {
    bytes: data.length,
    pageCount,
    pageCountSource,
    mediaBoxes,
    fonts,
  }
}

/** Fallback when o PDF está compactado (ex.: pós-processo pdf-lib). */
export async function inspectPdfResolved(file: string): Promise<PdfReport> {
  const report = inspectPdf(file)
  if (report.pageCount > 0 && report.mediaBoxes.length > 0) {
    return report
  }
  const data = readFileSync(file)
  const doc = await PDFDocument.load(data, { ignoreEncryption: true })
  const pageCount = doc.getPageCount()
  if (pageCount < 1) {
    return report
  }
  const first = doc.getPage(0)
  return {
    ...report,
    pageCount,
    pageCountSource: 'pdf-lib',
    mediaBoxes: [[0, 0, first.getWidth(), first.getHeight()]],
  }
}

export function assertPdfProfile(
  profile: 'digital' | 'print' | 'digital-spread',
  report: PdfReport,
): void {
  if (report.pageCount < 24) {
    throw new Error(
      `Expected at least 24 pages (full Organizações document), found ${report.pageCount} via ${report.pageCountSource}.`,
    )
  }

  const box = report.mediaBoxes[0]
  if (!box) {
    throw new Error('No MediaBox found in the PDF.')
  }

  const width = box[2] - box[0]
  const height = box[3] - box[1]
  if (profile === 'digital') {
    const widthOk = Math.abs(width - A4_WIDTH_PT) <= TOLERANCE_PT
    const heightOk = Math.abs(height - A4_HEIGHT_PT) <= TOLERANCE_PT
    if (!widthOk || !heightOk) {
      throw new Error(
        `Digital PDF media box is ${width.toFixed(2)} × ${height.toFixed(2)} pt. Expected A4 (${A4_WIDTH_PT} × ${A4_HEIGHT_PT}).`,
      )
    }
    return
  }

  if (profile === 'digital-spread') {
    const spreadWidthOk = Math.abs(width - SPREAD_WIDTH_PT) <= TOLERANCE_PT * 2
    const singleWidthOk = Math.abs(width - A4_WIDTH_PT) <= TOLERANCE_PT
    const heightOk = Math.abs(height - SPREAD_HEIGHT_PT) <= TOLERANCE_PT
    if ((!spreadWidthOk && !singleWidthOk) || !heightOk) {
      throw new Error(
        `Digital spread PDF media box is ${width.toFixed(2)} × ${height.toFixed(2)} pt. Expected ~A4 or ~${SPREAD_WIDTH_PT} wide × ${SPREAD_HEIGHT_PT} tall.`,
      )
    }
    return
  }

  if (width <= A4_WIDTH_PT + TOLERANCE_PT || height <= A4_HEIGHT_PT + TOLERANCE_PT) {
    throw new Error(
      `Print layout media box is ${width.toFixed(2)} × ${height.toFixed(2)} pt. Crop marks and bleed should make it larger than the A4 trim.`,
    )
  }
}

export function formatPdfReport(file: string, report: PdfReport): string {
  const box = report.mediaBoxes[0]
  const size = box ? `${(box[2] - box[0]).toFixed(2)} × ${(box[3] - box[1]).toFixed(2)} pt` : 'unknown'
  const fonts = report.fonts.length > 0 ? report.fonts.join(', ') : 'none found in clear text'
  return [
    file,
    `bytes: ${report.bytes}`,
    `pages: ${report.pageCount} (${report.pageCountSource})`,
    `media: ${size}`,
    `fonts: ${fonts}`,
  ].join('\n')
}

function readPdfInfo(file: string): string | null {
  const result = spawnSync('pdfinfo', [file], { encoding: 'utf8' })
  if (result.error || result.status !== 0 || !result.stdout) return null
  return result.stdout
}
