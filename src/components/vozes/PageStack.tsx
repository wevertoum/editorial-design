import { Children, isValidElement, type ReactNode } from 'react'

type PageStackProps = {
  children: ReactNode
  className?: string
}

function isDualTrackFoot(child: ReactNode): boolean {
  if (!isValidElement(child)) return false
  const props = child.props as { className?: string; part?: unknown }
  if (props.part === undefined) return false
  const cls = typeof props.className === 'string' ? props.className : ''
  return cls.includes('vozes-page-stack-foot')
}

/**
 * One-page flex column: put `vozes-page-stack-foot` on the last child to pin it
 * to the bottom margin (ActorBand / figure on Australia pp. 10–11).
 * Com dual-track no rodapé, agrupa o miolo em `.vozes-page-stack-prelude` para alinhar a faixa marfim na dupla.
 */
export function PageStack({ children, className }: PageStackProps) {
  const extra = className?.trim() ? ` ${className.trim()}` : ''
  const items = Children.toArray(children)
  const footIndex = items.findIndex((child) => isDualTrackFoot(child))
  const usesDualTrackGrid = footIndex > 0

  if (!usesDualTrackGrid) {
    return <div className={`vozes-page-stack${extra}`}>{children}</div>
  }

  const prelude = items.slice(0, footIndex)
  const foot = items[footIndex]
  const tail = items.slice(footIndex + 1)
  const compactPrelude = extra.includes('vozes-prelude--compact-milestone')
  const preludeClass = compactPrelude
    ? 'vozes-page-stack-prelude vozes-prelude--compact-milestone'
    : 'vozes-page-stack-prelude'

  return (
    <div className={`vozes-page-stack vozes-page-stack--dual-track${extra}`}>
      <div className={preludeClass}>{prelude}</div>
      {foot}
      {tail}
    </div>
  )
}
