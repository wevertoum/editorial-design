import publication from '../content/document.json'
import { App } from './App'
import { BundleProof } from './BundleProof'
import { resolveProfile } from './engine/profile'
import './styles/index.css'
import '@editorial-profile-css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const profile = resolveProfile(import.meta.env.MODE)
document.documentElement.dataset.profile = profile
document.documentElement.lang = publication.language
document.title = publication.title

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root is missing')
}

const searchParams = new URLSearchParams(window.location.search)
const bundleProofEnabled =
  import.meta.env.VITE_BUNDLE_PROOF === '1' || searchParams.get('bundle') === '1'
const bundleSectionId = searchParams.get('section') ?? 'apresentacao'

createRoot(root).render(
  <StrictMode>
    {bundleProofEnabled ? <BundleProof sectionId={bundleSectionId} /> : <App />}
  </StrictMode>,
)
