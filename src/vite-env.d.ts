/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUNDLE_PROOF?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  export const frontmatter: Record<string, unknown> | undefined
  const component: ComponentType
  export default component
}

declare module '*.css'
declare module '@editorial-profile-css'
