import type { ReactNode } from 'react'
import { EditorialTable } from '../components/EditorialTable'
import { Figure } from '../components/Figure'
import { Heading } from '../components/Heading'
import { Paragraph } from '../components/Paragraph'
import { SourceNote } from '../components/vozes/SourceNote'
import { VozesLayout, VozesMain, VozesRail } from '../components/vozes/VozesLayout'
import type { FlowBlock, TextRun } from './bundle-types'

function renderRuns(runs: TextRun[]): ReactNode {
  return runs.map((run, index) => {
    let node: ReactNode = run.text
    if (run.bold && run.italic) {
      node = (
        <strong>
          <em>{run.text}</em>
        </strong>
      )
    } else if (run.bold) {
      node = <strong>{run.text}</strong>
    } else if (run.italic) {
      node = <em>{run.text}</em>
    }
    return <span key={index}>{node}</span>
  })
}

function vozesLayoutClass(sectionId: string): string {
  const classes = ['vozes-prose-only']
  if (sectionId === 'apresentacao' || sectionId === 'resumo-executivo') {
    classes.push('vozes-front-matter')
  }
  return classes.join(' ')
}

export function renderFlowBlock(block: FlowBlock, key: string): ReactNode {
  switch (block.type) {
    case 'heading': {
      const level = block.level <= 3 ? (block.level as 1 | 2 | 3) : 3
      return (
        <Heading key={key} level={level}>
          {block.runs ? renderRuns(block.runs) : block.text}
        </Heading>
      )
    }
    case 'paragraph':
      return (
        <Paragraph key={key}>
          {renderRuns(block.runs)}
        </Paragraph>
      )
    case 'table':
      return (
        <EditorialTable
          key={key}
          caption={block.caption ?? ''}
          columns={block.headers}
          rows={block.rows}
          variant={block.variant === 'vozes' ? 'vozes' : 'default'}
        />
      )
    case 'image':
      return (
        <Figure
          key={key}
          src={block.src}
          alt={block.alt ?? ''}
          caption={block.caption}
          credit={block.credit}
        />
      )
    case 'component':
      if (block.name === 'SourceNote') {
        const children =
          typeof block.props.children === 'string' ? block.props.children : String(block.props.children ?? '')
        return <SourceNote key={key}>{children}</SourceNote>
      }
      return (
        <Paragraph key={key} className="bundle-unknown-component">
          [{block.name}]
        </Paragraph>
      )
    default:
      return null
  }
}

export function renderFlowBlocks(blocks: FlowBlock[], sectionId: string): ReactNode {
  return (
    <VozesLayout className={vozesLayoutClass(sectionId)}>
      <VozesMain>
        {blocks.map((block, index) => renderFlowBlock(block, `${sectionId}-${index}`))}
      </VozesMain>
      <VozesRail>{null}</VozesRail>
    </VozesLayout>
  )
}
