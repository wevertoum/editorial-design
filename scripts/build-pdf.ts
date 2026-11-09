import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertLength, readCustomProperty, readText } from './design-tokens'
import { assertPdfProfile, formatPdfReport, inspectPdf } from './pdf-report'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const profile = readFlag('--profile')
if (profile !== 'digital' && profile !== 'print') {
  console.error('Usage: tsx scripts/build-pdf.ts --profile digital|print')
  process.exit(1)
}

const outputPath = path.join(root, 'output', profile === 'print' ? 'document-print.pdf' : 'document-digital.pdf')
mkdirSync(path.dirname(outputPath), { recursive: true })

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
run(npm, ['run', 'validate'])
run(npm, ['run', profile === 'print' ? 'build:print' : 'build:digital'])

const cli = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vivliostyle.cmd' : 'vivliostyle',
)
run(cli, ['--version'])

const args = ['build', path.join('dist', 'index.html'), '--output', outputPath, '--no-vite-config-file']
if (profile === 'print') {
  const printFile = 'src/styles/print.css'
  const bleed = assertLength(
    readCustomProperty(readText(path.join(root, printFile)), '--bleed', printFile),
    printFile,
    '--bleed',
  )
  args.push('--crop-marks', '--bleed', bleed)
}

run(cli, args)

const report = inspectPdf(outputPath)
console.log(`\n${formatPdfReport(outputPath, report)}`)
try {
  assertPdfProfile(profile, report)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

function run(command: string, args: string[]) {
  console.log(`\n> ${[command, ...args].join(' ')}`)
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' })
  if (result.error) {
    console.error(result.error.message)
    process.exit(1)
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
