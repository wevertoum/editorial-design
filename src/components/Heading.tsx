import type { ComponentProps, ReactNode } from 'react'

type HeadingProps = ComponentProps<'h1'> & {
  level?: 1 | 2 | 3
  kicker?: string
  children?: ReactNode
}

export function Heading({ level = 1, kicker, className, children, ...rest }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const classes = ['heading', `heading-${level}`, className].filter(Boolean).join(' ')
  return (
    <Tag className={classes} {...rest}>
      {kicker ? <span className="kicker">{kicker}</span> : null}
      <span className="heading-text">{children}</span>
    </Tag>
  )
}
