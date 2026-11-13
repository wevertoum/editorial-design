import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { MaterialSymbol } from './MaterialSymbol'

type OrgHierarchyStepProps = {
  children: ReactNode
  /** Ligatura Material Symbols (opcional — há padrão por ordem). */
  icon?: string
}

const DEFAULT_ICONS = ['groups', 'podium', 'settings', 'hub'] as const

/** Filho de `OrgHierarchyFlow` — rótulo + ícone na pílula. */
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

function iconFromStep(child: ReactElement<OrgHierarchyStepProps>, index: number): string {
  const custom = child.props.icon?.trim()
  if (custom) return custom
  return DEFAULT_ICONS[index % DEFAULT_ICONS.length] ?? 'arrow_downward'
}

function FlowArrow() {
  return <MaterialSymbol ligature="keyboard_arrow_down" className="org-hierarchy-flow-arrow" />
}

const STEP_COUNT = 4

/** Hierarquia em pílulas (ícone + rótulo), com setas entre níveis. */
export function OrgHierarchyFlow({ children, className }: OrgHierarchyFlowProps) {
  const steps: { label: string; icon: string }[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type !== OrgHierarchyStep) return
    const label = labelFromStep(child as ReactElement<OrgHierarchyStepProps>)
    if (!label) return
    steps.push({
      label,
      icon: iconFromStep(child as ReactElement<OrgHierarchyStepProps>, steps.length),
    })
  })

  const extra = className?.trim() ? ` ${className.trim()}` : ''

  if (steps.length === 0) return null

  return (
    <div className={`org-hierarchy-flow${extra}`} role="list" aria-label="Estrutura organizacional">
      {steps.map((step, index) => (
        <div key={`${index}-${step.label}`} className="org-hierarchy-flow-item" role="listitem">
          <div
            className={`org-hierarchy-pill org-hierarchy-pill--${index % STEP_COUNT}`}
          >
            <span className="org-hierarchy-pill-icon" aria-hidden>
              <MaterialSymbol ligature={step.icon} className="org-hierarchy-pill-glyph" />
            </span>
            <span className="org-hierarchy-pill-label">{step.label}</span>
          </div>
          {index < steps.length - 1 ? <FlowArrow /> : null}
        </div>
      ))}
    </div>
  )
}
