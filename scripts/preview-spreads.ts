import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chokidar from 'chokidar'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stampPath = path.join(root, 'dist', '.dev-build-stamp.txt')

const skipInitialBuild = process.argv.includes('--no-build')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const cli = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vivliostyle.cmd' : 'vivliostyle',
)

const previewArgs = [
  'preview',
  path.join('dist', 'index.html'),
  '--no-vite-config-file',
  '--host',
  '127.0.0.1',
  '--port',
  '13000',
  '-d',
  '--viewer-param',
  'spread=true',
]

const watchGlobs = [
  path.join(root, 'content'),
  path.join(root, 'src'),
  path.join(root, 'assets'),
  path.join(root, 'vite.config.ts'),
]

const debounceMs = 500

let previewChild: ChildProcess | null = null
let rebuildTimer: ReturnType<typeof setTimeout> | null = null
let rebuildInFlight = false
let rebuildQueued = false

const PREVIEW_VIEWER_URL =
  'http://127.0.0.1:13000/__vivliostyle-viewer/index.html#src=http://127.0.0.1:13000/vivliostyle/index.html&bookMode=false&renderAllPages=true&spread=true'

console.log('\nPrévia paginada (Vivliostyle) · páginas em spread · numeração em @page')
console.log('Abra esta URL (só http://127.0.0.1:13000/ não mostra o livro):')
console.log(PREVIEW_VIEWER_URL)
console.log(
  'Watch ativo: ao salvar conteúdo, estilos ou fontes, a prévia reconstrói e atualiza sozinha.',
)
console.log('A primeira compilação pode demorar; as seguintes são mais rápidas.')
console.log('Para edição rápida sem paginação, use npm run dev:edit.\n')

if (!skipInitialBuild) {
  const ok = runBuildDigital()
  if (!ok) process.exit(1)
  writeBuildStamp()
} else if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('dist/index.html não existe. Rode npm run dev sem --no-build primeiro.')
  process.exit(1)
}

startPreview()
startWatcher()

function startPreview() {
  console.log(`> ${[cli, ...previewArgs].join(' ')}`)
  previewChild = spawn(cli, previewArgs, { cwd: root, stdio: 'inherit' })
  previewChild.on('exit', (code, signal) => {
    if (signal) {
      process.exit(0)
    }
    process.exit(code ?? 1)
  })
}

function startWatcher() {
  const watcher = chokidar.watch(watchGlobs, {
    ignoreInitial: true,
    ignored: [
      /(^|[/\\])\../,
      '**/node_modules/**',
      path.join(root, 'dist'),
      path.join(root, 'output'),
    ],
  })

  const scheduleRebuild = () => {
    if (rebuildTimer) clearTimeout(rebuildTimer)
    rebuildTimer = setTimeout(() => {
      rebuildTimer = null
      void runRebuild()
    }, debounceMs)
  }

  watcher.on('add', scheduleRebuild)
  watcher.on('change', scheduleRebuild)
  watcher.on('unlink', scheduleRebuild)

  const shutdown = () => {
    watcher.close()
    if (rebuildTimer) clearTimeout(rebuildTimer)
    if (previewChild && !previewChild.killed) {
      previewChild.kill('SIGTERM')
    }
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

async function runRebuild() {
  if (rebuildInFlight) {
    rebuildQueued = true
    return
  }
  rebuildInFlight = true
  console.log('\nReconstruindo…')
  const ok = runBuildDigital()
  if (ok) {
    writeBuildStamp()
    console.log('Prévia atualizada (o visualizador recarrega em instantes).\n')
  } else {
    console.error('Reconstrução falhou — corrija o erro e salve de novo.\n')
  }
  rebuildInFlight = false
  if (rebuildQueued) {
    rebuildQueued = false
    void runRebuild()
  }
}

function runBuildDigital(): boolean {
  console.log(`> ${npm} run build:digital`)
  const result = spawnSync(npm, ['run', 'build:digital'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, EDITORIAL_DEV_WATCH: '1' },
  })
  if (result.error) {
    console.error(result.error.message)
    return false
  }
  return (result.status ?? 1) === 0
}

function writeBuildStamp() {
  fs.mkdirSync(path.dirname(stampPath), { recursive: true })
  fs.writeFileSync(stampPath, `${Date.now()}\n`, 'utf8')
}
