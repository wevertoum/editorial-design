import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useRef,
} from 'react'

const GOVERNANCA_HEADING = 'A governança'

export type ProfileGovernanceHighlightStore = {
  profileNames: Set<string>
  inGovernanca: boolean
}

const ProfileGovernanceHighlightContext = createContext<ProfileGovernanceHighlightStore | null>(null)

export function isGovernancaHeadingText(text: string): boolean {
  const trimmed = text.trim()
  return trimmed === GOVERNANCA_HEADING || trimmed.endsWith(GOVERNANCA_HEADING)
}

export function flattenChildrenToText(children: ReactNode): string {
  let text = ''
  Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      text += String(child)
    } else if (isValidElement(child)) {
      text += flattenChildrenToText((child.props as { children?: ReactNode }).children)
    }
  })
  return text
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function highlightProfileNamesInText(text: string, names: string[]): ReactNode[] {
  if (!text || names.length === 0) return [text]
  const pattern = names.map(escapeRegExp).join('|')
  const re = new RegExp(`(${pattern})`, 'g')
  const parts = text.split(re)
  if (parts.length === 1) return [text]
  const nameSet = new Set(names)
  return parts.map((part, index) =>
    nameSet.has(part) ? (
      <mark key={`${index}-${part}`} className="profile-name-highlight">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function highlightProfileNamesInChildren(children: ReactNode, names: string[]): ReactNode {
  if (names.length === 0) return children
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return highlightProfileNamesInText(child, names)
    }
    if (typeof child === 'number') {
      return highlightProfileNamesInText(String(child), names)
    }
    if (isValidElement(child)) {
      const el = child as ReactElement<{ children?: ReactNode }>
      if (el.props.children === undefined) return child
      return cloneElement(el, {
        children: highlightProfileNamesInChildren(el.props.children, names),
      })
    }
    return child
  })
}

export function useProfileGovernanceHighlight(): ProfileGovernanceHighlightStore | null {
  return useContext(ProfileGovernanceHighlightContext)
}

export function ProfileGovernanceHighlightProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ProfileGovernanceHighlightStore>({
    profileNames: new Set<string>(),
    inGovernanca: false,
  })

  storeRef.current.profileNames.clear()
  storeRef.current.inGovernanca = false

  return (
    <ProfileGovernanceHighlightContext.Provider value={storeRef.current}>
      {children}
    </ProfileGovernanceHighlightContext.Provider>
  )
}

export function registerProfileName(store: ProfileGovernanceHighlightStore | null, name: string): void {
  if (!store || !name.trim()) return
  store.profileNames.add(name.trim())
}

export function updateGovernancaFromHeading(
  store: ProfileGovernanceHighlightStore | null,
  level: number,
  children: ReactNode,
): void {
  if (!store || level !== 3) return
  const text = flattenChildrenToText(children)
  if (isGovernancaHeadingText(text)) {
    store.inGovernanca = true
  } else {
    store.inGovernanca = false
  }
}

export function governanceHighlightNames(store: ProfileGovernanceHighlightStore | null): string[] {
  if (!store?.inGovernanca || store.profileNames.size === 0) return []
  return [...store.profileNames]
}
