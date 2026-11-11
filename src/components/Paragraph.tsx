import type { ComponentProps } from 'react'
import {
  governanceHighlightNames,
  highlightProfileNamesInChildren,
  useProfileGovernanceHighlight,
} from '../lib/profileGovernanceHighlight'

export function Paragraph({ className, children, ...rest }: ComponentProps<'p'>) {
  const store = useProfileGovernanceHighlight()
  const names = governanceHighlightNames(store)
  const body = names.length > 0 ? highlightProfileNamesInChildren(children, names) : children

  return (
    <p className={className} {...rest}>
      {body}
    </p>
  )
}
