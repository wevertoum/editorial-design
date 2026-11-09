import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command, mode }) => {
  const profileStyles = mode === 'print' ? 'src/styles/print.css' : 'src/styles/digital.css'
  // Vivliostyle CLI 11.4.0 serves the input directory at /vivliostyle
  // and loads the document inside /__vivliostyle-viewer, so relative
  // asset URLs 404. PDF builds use that mount path. Dev stays at /.
  const base = process.env.EDITORIAL_PDF_BASE || (command === 'build' ? '/vivliostyle/' : '/')

  return {
    base,
    publicDir: 'assets',
    build: {
      assetsDir: 'static',
      outDir: 'dist',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@editorial-profile-css': path.join(root, profileStyles),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
    plugins: [
      {
        enforce: 'pre',
        ...mdx({
          providerImportSource: '@mdx-js/react',
          remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        }),
      },
      react({ include: /\.(mdx|md|js|jsx|ts|tsx)$/ }),
    ],
  }
})
