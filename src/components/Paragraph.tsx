import type { ComponentProps } from 'react'

export function Paragraph({ className, children, ...rest }: ComponentProps<'p'>) {
  return (
    <p className={className} {...rest}>
      {children}
    </p>
  )
}
