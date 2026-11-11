import { assetUrl } from '../lib/assetUrl'

type FigureProps = {
  src: string
  alt: string
  caption?: string
  credit?: string
}

export function Figure({ src, alt, caption, credit }: FigureProps) {
  if (!alt.trim()) {
    throw new Error(`Figure "${src}" needs alt text`)
  }

  return (
    <figure className="figure">
      <img src={assetUrl(src)} alt={alt} />
      {caption?.trim() || credit ? (
        <figcaption>
          {caption?.trim() ? <span className="figure-caption">{caption}</span> : null}
          {credit ? <span className="figure-credit">{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
