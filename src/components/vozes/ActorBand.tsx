import { renderInlineText } from '../../content/renderRuns'
import { MaterialSymbol } from './MaterialSymbol'

type ActorBandProps = {
  title?: string
  /** Actor + role pairs: [title with optional \\n subtitle, body]. */
  items: string[][]
  /** Ligaturas Material Symbols (uma por item), alinhadas a `items`. */
  icons?: string[]
  columns?: number
  className?: string
}

function splitTitle(cell: string) {
  const lines = cell.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return { name: '', note: undefined as string | undefined }
  const [name, ...rest] = lines
  return { name, note: rest.length ? rest.join(' ') : undefined }
}

export function ActorBand({ title, items, icons, columns = 4, className }: ActorBandProps) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('ActorBand needs at least one item')
  }

  items.forEach((item, index) => {
    if (!Array.isArray(item) || item.length < 2 || typeof item[0] !== 'string' || typeof item[1] !== 'string') {
      throw new Error(`ActorBand item ${index + 1} must be [title, body]`)
    }
  })

  if (icons != null) {
    if (!Array.isArray(icons) || icons.length !== items.length) {
      throw new Error('ActorBand icons must be an array with one ligature per item')
    }
    icons.forEach((ligature, index) => {
      if (typeof ligature !== 'string' || !ligature.trim()) {
        throw new Error(`ActorBand icon ${index + 1} must be a non-empty ligature string`)
      }
    })
  }

  const colCount = Math.max(1, Math.min(columns, items.length))
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const hasIcons = Boolean(icons?.length)

  return (
    <section
      className={`actor-band${hasIcons ? ' actor-band--icons' : ''}${extra}`}
      aria-label={title?.trim() || 'Principais atores'}
    >
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
          const ligature = icons?.[index]?.trim()
          const head = (
            <div className="actor-band-head">
              <p className="actor-band-name">{renderInlineText(name)}</p>
              {note ? <p className="actor-band-note">{renderInlineText(note)}</p> : null}
            </div>
          )
          const bodyEl = <p className="actor-band-body">{renderInlineText(body)}</p>

          if (ligature) {
            return (
              <div className="actor-band-item actor-band-item--icon" role="listitem" key={index}>
                <MaterialSymbol ligature={ligature} className="actor-band-icon" />
                <div className="actor-band-item-main">
                  {head}
                  {bodyEl}
                </div>
              </div>
            )
          }

          return (
            <div className="actor-band-item" role="listitem" key={index}>
              {head}
              {bodyEl}
            </div>
          )
        })}
      </div>
    </section>
  )
}
