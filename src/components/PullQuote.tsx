import type { ComponentProps } from 'react'

type PullQuoteProps = ComponentProps<'blockquote'> & {
  attribution?: string
}

export function PullQuote({ attribution, className, children, ...rest }: PullQuoteProps) {
  const classes = ['pull-quote', className].filter(Boolean).join(' ')
  return (
    <blockquote className={classes} {...rest}>
      <div className="pull-quote-body">{children}</div>
      {attribution ? <footer className="pull-quote-attribution">{attribution}</footer> : null}
    </blockquote>
  )
}
