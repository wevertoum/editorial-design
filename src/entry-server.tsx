import { renderToStaticMarkup } from 'react-dom/server'
import publication from '../content/document.json'
import { App } from './App'
import { resolveProfile } from './engine/profile'

export function renderPublication() {
  const profile = resolveProfile(import.meta.env.MODE)
  return {
    profile,
    language: publication.language,
    title: publication.title,
    body: renderToStaticMarkup(<App />),
  }
}
