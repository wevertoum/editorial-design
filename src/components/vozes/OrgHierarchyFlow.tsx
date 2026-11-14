import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'
import { ActorBandMarker } from './ActorBandMarker'

type OrgHierarchyStepProps = {
  children: ReactNode
  /** Mantido por compatibilidade MDX — ícones não são mais usados no diagrama. */
  icon?: string
}

/** Filho de `OrgHierarchyFlow` — um nível da hierarquia. */
export function OrgHierarchyStep({ children }: OrgHierarchyStepProps) {
  return <>{children}</>
}

type OrgHierarchyFlowProps = {
  children: ReactNode
  className?: string
}

function labelFromStep(child: ReactElement<OrgHierarchyStepProps>): string {
  const { children } = child.props
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children).trim()
  }
  if (Array.isArray(children)) {
    return children
      .map((part) => (typeof part === 'string' || typeof part === 'number' ? String(part) : ''))
      .join('')
      .trim()
  }
  return ''
}

function FlowArrow() {
  return <span className="org-hierarchy-flow-arrow" aria-hidden />
}

/** Hierarquia em coluna — marcador gráfico + rótulo; sem contorno. */
export function OrgHierarchyFlow({ children, className }: OrgHierarchyFlowProps) {
  const steps: string[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type !== OrgHierarchyStep) return
    const label = labelFromStep(child as ReactElement<OrgHierarchyStepProps>)
    if (!label) return
    steps.push(label)
  })

  const extra = className?.trim() ? ` ${className.trim()}` : ''

  if (steps.length === 0) return null

  return (
    <div className={`org-hierarchy-flow${extra}`} role="list" aria-label="Estrutura organizacional">
      {steps.map((label, index) => (
        <Fragment key={`${index}-${label}`}>
          {index > 0 ? <FlowArrow /> : null}
          <div className="org-hierarchy-flow-step" role="listitem">
            <ActorBandMarker index={index} className="org-hierarchy-marker" />
            <span className="org-hierarchy-label">{label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}