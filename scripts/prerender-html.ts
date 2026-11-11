import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import type { OutputProfile } from '../src/engine/profile'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const profile = readFlag('--profile')
if (profile !== 'digital' && profile !== 'print') {
  console.error('Usage: tsx scripts/prerender-html.ts --profile digital|print')
  process.exit(1)
}

// Vivliostyle paginates the HTML it first loads. A client-rendered root
// stays inside a single page box, so the PDF input has to be static markup.
process.env.EDITORIAL_PDF_BASE = '/vivliostyle/'

const vite = await createServer({
  configFile: path.join(root, 'vite.config.ts'),
  mode: profile,
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const rendered = await renderPublication(profile)
  const builtPath = path.join(root, 'dist', 'index.html')
  const built = readFileSync(builtPath, 'utf8')
  const styles = [...built.matchAll(/<link rel="stylesheet"[^>]*>/g)].map((match) => match[0])
  if (styles.length === 0) {
    throw new Error('The Vite build did not emit a stylesheet link')
  }
  if (!rendered.body.includes('class="sheet')) {
    throw new Error('Prerender produced no sheets')
  }
  if (!rendered.body.includes('/vivliostyle/media/')) {
    throw new Error('Prerender asset URLs are missing the /vivliostyle/ base')
  }

  const devWatchScript =
    process.env.EDITORIAL_DEV_WATCH === '1'
      ? `
    <script type="module">
      let last = '';
      setInterval(async () => {
        try {
          const response = await fetch(
            '/vivliostyle/.dev-build-stamp.txt?nocache=' + Date.now(),
          );
          if (!response.ok) return;
          const stamp = await response.text();
          if (last && stamp !== last) location.reload();
          last = stamp;
        } catch {
          /* servidor ou stamp ainda ausente */
        }
      }, 600);
    </script>`
      : ''

  const html = `<!doctype html>
<html lang="${escapeHtml(rendered.language)}" data-profile="${rendered.profile}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(rendered.title)}</title>
    ${styles.join('\n    ')}
  </head>
  <body>
    ${rendered.body}${devWatchScript}
  </body>
</html>
`
  writeFileSync(builtPath, html)
  console.log(`Prerendered dist/index.html for the ${profile} profile`)
} finally {
  await vite.close()
}

async function renderPublication(mode: OutputProfile) {
  const mod = (await vite.ssrLoadModule('/src/entry-server.tsx')) as {
    renderPublication: () => {
      profile: OutputProfile
      language: string
      title: string
      body: string
    }
  }
  const rendered = mod.renderPublication()
  if (rendered.profile !== mode) {
    throw new Error(`Prerender profile was ${rendered.profile}, expected ${mode}`)
  }
  return rendered
}

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
