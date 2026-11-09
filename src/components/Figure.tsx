import { assetUrl } from '../lib/assetUrl'

type FigureProps = {
  src: string
  alt: string
  caption: string
  credit?: string
}

export function Figure({ src, alt, caption, credit }: FigureProps) {
  if (!alt.trim()) {
    throw new Error(`Figure "${src}" needs alt text`)
  }
  if (!caption.trim()) {
    throw new Error(`Figure "${src}" needs a caption`)
  }

  return (
    <figure className="figure">
      <img src={assetUrl(src)} alt={alt} />
      <figcaption>
        <span className="figure-caption">{caption}</span>
        {credit ? <span className="figure-credit">{credit}</span> : null}
      </figcaption>
    </figure>
  )
}
