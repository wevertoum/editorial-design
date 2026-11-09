import { loadPublication } from './content/loadDocument'
import { DocumentShell } from './layouts/DocumentShell'

const publication = loadPublication()

export function App() {
  return <DocumentShell publication={publication} />
}
