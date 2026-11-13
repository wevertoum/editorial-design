import type { ComponentProps } from 'react'
import { Columns } from './components/Columns'
import { EditorialTable } from './components/EditorialTable'
import { Figure } from './components/Figure'
import { Heading } from './components/Heading'
import { HighlightBox } from './components/HighlightBox'
import { Paragraph } from './components/Paragraph'
import { PullQuote } from './components/PullQuote'
import { CalloutCard } from './components/vozes/CalloutCard'
import { CountryOpening } from './components/vozes/CountryOpening'
import { DetailList } from './components/vozes/DetailList'
import { DetailListGrid } from './components/vozes/DetailListGrid'
import { DimensionList } from './components/vozes/DimensionList'
import { FactsRail, RailItem } from './components/vozes/FactsRail'
import { MilestoneItem, MilestoneStrip } from './components/vozes/MilestoneStrip'
import { ProfileCard } from './components/vozes/ProfileCard'
import { ActorBand } from './components/vozes/ActorBand'
import { DualTrackEmbed } from './components/vozes/DualTrackEmbed'
import { PageStack } from './components/vozes/PageStack'
import { ParticipationBox } from './components/vozes/ParticipationBox'
import { TrajetoriaBox } from './components/vozes/TrajetoriaBox'
import { SourceNote } from './components/vozes/SourceNote'
import { VozesLayout, VozesMain, VozesRail } from './components/vozes/VozesLayout'

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
  Heading,
  HighlightBox,
  PullQuote,
  VozesLayout,
  VozesMain,
  VozesRail,
  CountryOpening,
  ProfileCard,
  CalloutCard,
  FactsRail,
  RailItem,
  DetailList,
  DetailListGrid,
  DimensionList,
  SourceNote,
  MilestoneStrip,
  MilestoneItem,
  ActorBand,
  DualTrackEmbed,
  PageStack,
  ParticipationBox,
  TrajetoriaBox,
}
