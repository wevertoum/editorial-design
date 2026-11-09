import type { ComponentProps } from 'react'
import { Columns } from './components/Columns'
import { EditorialTable } from './components/EditorialTable'
import { Figure } from './components/Figure'
import { Heading } from './components/Heading'
import { HighlightBox } from './components/HighlightBox'
import { Paragraph } from './components/Paragraph'
import { PullQuote } from './components/PullQuote'

type WithNode<T> = T & { node?: unknown }

function withoutNode<T extends { node?: unknown }>(props: T) {
  const copy = { ...props }
  delete copy.node
  return copy
}

export const mdxComponents = {
  h1: (props: WithNode<ComponentProps<'h1'>>) => <Heading level={1} {...withoutNode(props)} />,
  h2: (props: WithNode<ComponentProps<'h2'>>) => <Heading level={2} {...withoutNode(props)} />,
  h3: (props: WithNode<ComponentProps<'h3'>>) => <Heading level={3} {...withoutNode(props)} />,
  p: (props: WithNode<ComponentProps<'p'>>) => <Paragraph {...withoutNode(props)} />,
  blockquote: (props: WithNode<ComponentProps<'blockquote'>>) => <PullQuote {...withoutNode(props)} />,
  Columns,
  EditorialTable,
  Figure,
  HighlightBox,
  PullQuote,
}
