import { renderInlineText } from '../../content/renderRuns'

type ActorBandProps = {
  title?: string
  /** Actor + role pairs: [title with optional \\n subtitle, body]. */
  items: string[][]
  columns?: number
  className?: string
}

function splitTitle(cell: string) {
  const lines = cell.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return { name: '', note: undefined as string | undefined }
  const [name, ...rest] = lines
  return { name, note: rest.length ? rest.join(' ') : undefined }
}

export function ActorBand({ title, items, columns = 4, className }: ActorBandProps) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('ActorBand needs at least one item')
  }

  items.forEach((item, index) => {
    if (!Array.isArray(item) || item.length < 2 || typeof item[0] !== 'string' || typeof item[1] !== 'string') {
      throw new Error(`ActorBand item ${index + 1} must be [title, body]`)
    }
  })

  const colCount = Math.max(1, Math.min(columns, items.length))
  const extra = className?.trim() ? ` ${className.trim()}` : ''

  return (
    <section className={`actor-band${extra}`} aria-label={title?.trim() || 'Principais atores'}>
      {title?.trim() ? (
        <h3 className="band-label actor-band-label">
          <span className="band-label-text">{renderInlineText(title.trim())}</span>
        </h3>
      ) : null}
      <div
        className="actor-band-grid"
        data-columns={colCount}
        role="list"
      >
        {items.map((item, index) => {
          const { name, note } = splitTitle(item[0])
          const body = item[1]
          return (
            <div className="actor-band-item" role="listitem" key={index}>
              <div className="actor-band-head">
                <p className="actor-band-name">{renderInlineText(name)}</p>
                {note ? <p className="actor-band-note">{renderInlineText(note)}</p> : null}
              </div>
              <p className="actor-band-body">{renderInlineText(body)}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
