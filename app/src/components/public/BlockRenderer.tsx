import type { Block, BlockOf } from '@/cms/blocks';
import { AboutIntro, FactStrip } from './blocks/AboutIntro';
import { ApproachSplit } from './blocks/ApproachSplit';
import { ApproachSteps } from './blocks/ApproachSteps';
import { ArticleGrid } from './blocks/ArticleGrid';
import { AudienceList } from './blocks/AudienceList';
import { CapabilityPanels } from './blocks/CapabilityPanels';
import { ContactBand } from './blocks/ContactBand';
import { CtaBand } from './blocks/CtaBand';
import { FrameworkStrip } from './blocks/FrameworkStrip';
import { HeroFramed } from './blocks/HeroFramed';
import { ImageBlock } from './blocks/ImageBlock';
import { MissionVision } from './blocks/MissionVision';
import { PageHeader } from './blocks/PageHeader';
import { RichTextBlock } from './blocks/RichTextBlock';
import { ServiceCarousel } from './blocks/ServiceCarousel';
import { SplitImage } from './blocks/SplitImage';
import { TopicList } from './blocks/TopicList';
import { ValuesGrid } from './blocks/ValuesGrid';
import { WhyGrid } from './blocks/WhyGrid';
import type { RenderContext } from './blocks/types';

/**
 * Renders a page's visible blocks in order (DS v3 §9). Two layout pairings are decided by position, not styling
 * options: an aboutIntro followed by a factStrip renders them side by side (§7.5), and capabilityPanels straight
 * after a heroFramed overlaps the hero (§7.4).
 */
export function BlockRenderer({
  blocks,
  ctx = {},
}: {
  blocks: readonly Block[];
  ctx?: RenderContext;
}) {
  const visible = blocks.filter((b) => b.visible);
  const out: React.ReactNode[] = [];

  for (let i = 0; i < visible.length; i += 1) {
    const block = visible[i]!;
    const prev = visible[i - 1];
    const next = visible[i + 1];

    if (block.type === 'aboutIntro') {
      const facts = next?.type === 'factStrip' ? (next as BlockOf<'factStrip'>) : null;
      out.push(<AboutIntro key={block.id} block={block} facts={facts} />);
      if (facts) i += 1;
      continue;
    }

    const blockCtx: RenderContext =
      block.type === 'capabilityPanels'
        ? { ...ctx, overlapHero: prev?.type === 'heroFramed' }
        : ctx;
    out.push(renderOne(block, blockCtx));
  }

  return <>{out}</>;
}

function renderOne(block: Block, ctx: RenderContext): React.ReactNode {
  const key = block.id;
  switch (block.type) {
    case 'pageHeader':
      return <PageHeader key={key} block={block} ctx={ctx} />;
    case 'heroFramed':
      return <HeroFramed key={key} block={block} ctx={ctx} />;
    case 'capabilityPanels':
      return <CapabilityPanels key={key} block={block} ctx={ctx} />;
    case 'aboutIntro':
      return <AboutIntro key={key} block={block} />;
    case 'factStrip':
      return <FactStrip key={key} block={block} />;
    case 'frameworkStrip':
      return <FrameworkStrip key={key} block={block} ctx={ctx} />;
    case 'serviceCarousel':
      return <ServiceCarousel key={key} block={block} ctx={ctx} />;
    case 'approachSplit':
      return <ApproachSplit key={key} block={block} ctx={ctx} />;
    case 'approachSteps':
      return <ApproachSteps key={key} block={block} ctx={ctx} />;
    case 'audienceList':
      return <AudienceList key={key} block={block} ctx={ctx} />;
    case 'splitImage':
      return <SplitImage key={key} block={block} ctx={ctx} />;
    case 'whyGrid':
      return <WhyGrid key={key} block={block} ctx={ctx} />;
    case 'valuesGrid':
      return <ValuesGrid key={key} block={block} ctx={ctx} />;
    case 'missionVision':
      return <MissionVision key={key} block={block} ctx={ctx} />;
    case 'topicList':
      return <TopicList key={key} block={block} ctx={ctx} />;
    case 'articleGrid':
      return <ArticleGrid key={key} block={block} ctx={ctx} />;
    case 'richText':
      return <RichTextBlock key={key} block={block} ctx={ctx} />;
    case 'image':
      return <ImageBlock key={key} block={block} ctx={ctx} />;
    case 'ctaBand':
      return <CtaBand key={key} block={block} ctx={ctx} />;
    case 'contactBand':
      return <ContactBand key={key} block={block} ctx={ctx} />;
  }
}
