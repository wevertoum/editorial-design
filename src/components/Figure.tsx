import { assetUrl } from '../lib/assetUrl'
import { parseInlineRuns } from '../content/inline-markdown'
import { renderRuns } from '../content/renderRuns'

type FigureProps = {
  src: string
  alt: string
  caption?: string
  credit?: string
  placement?: 'rail' | 'span'
  /** Optional local modifiers, e.g. figure--compact */
  className?: string
}

export function Figure({ src, alt, caption, credit, placement, className }: FigureProps) {
  if (!alt.trim()) {
    throw new Error(`Figure "${src}" needs alt text`)
  }

  const placementClass = placement === 'span' ? ' figure--span' : placement === 'rail' ? ' figure--rail' : ''
  const extraClass = className?.trim() ? ` ${className.trim()}` : ''
  const captionText = caption?.trim()
  const creditText = credit?.trim()

  return (
    <figure className={`figure${placementClass}${extraClass}`}>
      <img src={assetUrl(src)} alt={alt} />
      {captionText || creditText ? (
        <figcaption>
          {captionText ? <span className="figure-caption">{renderRuns(parseInlineRuns(captionText))}</span> : null}
          {creditText ? <span className="figure-credit">{renderRuns(parseInlineRuns(creditText))}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
