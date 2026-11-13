import type { ReactNode } from 'react'
import { EditorialTable } from '../components/EditorialTable'
import { Figure } from '../components/Figure'
import { Heading } from '../components/Heading'
import { Paragraph } from '../components/Paragraph'
import { CountryOpening } from '../components/vozes/CountryOpening'
import { SourceNote } from '../components/vozes/SourceNote'
import { VozesLayout, VozesMain, VozesRail } from '../components/vozes/VozesLayout'
import { DetailList } from '../components/vozes/DetailList'
import { DimensionList } from '../components/vozes/DimensionList'
import { ProfileCard } from '../components/vozes/ProfileCard'
import { ActorBand } from '../components/vozes/ActorBand'
import { MilestoneStrip } from '../components/vozes/MilestoneStrip'
import type { FlowBlock } from './bundle-types'
import { parseInlineRuns } from './inline-markdown'
import { renderRuns } from './renderRuns'

const RAIL_COMPONENTS = new Set(['ProfileCard', 'FactsRail', 'CalloutCard'])

const GOVERNANCA_HEADING = 'A governança'

function isGovernancaHeading(block: FlowBlock): boolean {
  if (block.type !== 'heading' || block.level !== 3) return false
  const text = (block.text ?? '').trim()
  return text === GOVERNANCA_HEADING || text.endsWith(GOVERNANCA_HEADING)
}

function splitFlowBlocks(blocks: FlowBlock[]): { main: FlowBlock[]; rail: FlowBlock[]; hasProfile: boolean } {
  const profiles: FlowBlock[] = []
  const rail: FlowBlock[] = []
  const prose: FlowBlock[] = []

  for (const block of blocks) {
    if (block.type === 'component' && block.name === 'ProfileCard') {
      profiles.push(block)
      continue
    }
    if (block.type === 'component' && RAIL_COMPONENTS.has(block.name)) {
      rail.push(block)
      continue
    }
    prose.push(block)
  }

  const main: FlowBlock[] = []
  let profileInserted = false
  for (const block of prose) {
    main.push(block)
    if (!profileInserted && isGovernancaHeading(block) && profiles.length > 0) {
      main.push(...profiles)
      profileInserted = true
    }
  }
  if (!profileInserted && profiles.length > 0) {
    main.push(...profiles)
  }

  return { main, rail, hasProfile: profiles.length > 0 }
}

function renderDetailListContent(source: string): ReactNode {
  const trimmed = source.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\n\n+/)
  if (parts.length >= 2) {
    return (
      <>
        <strong>{renderRuns(parseInlineRuns(parts[0]))}</strong>
        <br />
        {renderRuns(parseInlineRuns(parts.slice(1).join('\n\n')))}
      </>
    )
  }
  return renderRuns(parseInlineRuns(trimmed))
}

/** Paragraph-per-block so DimensionList can baseline-align number + title. */
function renderDimensionListContent(source: string): ReactNode {
  const trimmed = source.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\n\n+/).filter(Boolean)
  return (
    <>
      {parts.map((part, index) => (
        <p key={index}>{renderRuns(parseInlineRuns(part))}</p>
      ))}
    </>
  )
}

function stringProp(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function renderFlowBlock(block: FlowBlock, key: string): ReactNode {
  switch (block.type) {
    case 'heading': {
      const level = block.level <= 3 ? (block.level as 1 | 2 | 3) : 3
      return (
        <Heading key={key} level={level} className={block.className}>
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
          placement={block.placement}
          className={block.className}
        />
      )
    case 'component':
      if (block.name === 'SourceNote') {
        const children =
          typeof block.props.children === 'string' ? block.props.children : String(block.props.children ?? '')
        return <SourceNote key={key}>{children}</SourceNote>
      }
      if (block.name === 'DetailList') {
        const children =
          typeof block.props.children === 'string' ? block.props.children : String(block.props.children ?? '')
        const iconRaw = typeof block.props.icon === 'string' ? block.props.icon : undefined
        const icon =
          iconRaw === 'structure' || iconRaw === 'write' || iconRaw === 'implement' || iconRaw === 'monitor'
            ? iconRaw
            : undefined
        return (
          <DetailList key={key} icon={icon}>
            {renderDetailListContent(children)}
          </DetailList>
        )
      }
      if (block.name === 'DimensionList') {
        const children =
          typeof block.props.children === 'string' ? block.props.children : String(block.props.children ?? '')
        return (
          <DimensionList key={key} number={stringProp(block.props.number)}>
            {renderDimensionListContent(children)}
          </DimensionList>
        )
      }
      if (block.name === 'CountryOpening') {
        return (
          <CountryOpening
            key={key}
            code={stringProp(block.props.code)}
            title={stringProp(block.props.title)}
            lead={stringProp(block.props.lead) || undefined}
          />
        )
      }
      if (block.name === 'ProfileCard') {
        return (
          <ProfileCard
            key={key}
            name={stringProp(block.props.name)}
            role={stringProp(block.props.role)}
            bio={stringProp(block.props.bio)}
            photo={stringProp(block.props.photo)}
          />
        )
      }
      if (block.name === 'ActorBand' && Array.isArray(block.props.items)) {
        const columns =
          typeof block.props.columns === 'number' ? block.props.columns : 4
        return (
          <ActorBand
            key={key}
            title={typeof block.props.title === 'string' ? block.props.title : undefined}
            columns={columns}
            items={block.props.items as string[][]}
            className={typeof block.props.className === 'string' ? block.props.className : undefined}
          />
        )
      }
      if (block.name === 'MilestoneStrip' && Array.isArray(block.props.items)) {
        return (
          <MilestoneStrip
            key={key}
            title={typeof block.props.title === 'string' ? block.props.title : undefined}
            items={block.props.items as string[][]}
            className={typeof block.props.className === 'string' ? block.props.className : undefined}
          />
        )
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
  const { main, rail, hasProfile } = splitFlowBlocks(blocks)
  const isFront = sectionId === 'apresentacao' || sectionId === 'resumo-executivo'
  const layoutClass = [
    hasProfile || rail.length > 0 ? 'vozes-with-rail' : 'vozes-prose-only',
    isFront ? 'vozes-front-matter' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <VozesLayout className={layoutClass}>
      <VozesMain>
        {main.map((block, index) => renderFlowBlock(block, `${sectionId}-${index}`))}
      </VozesMain>
      {rail.length > 0 ? (
        <VozesRail>
          {rail.map((block, index) => renderFlowBlock(block, `${sectionId}-rail-${index}`))}
        </VozesRail>
      ) : null}
    </VozesLayout>
  )
}
