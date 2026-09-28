import { z } from 'zod';
import { aboutIntroData, createAboutIntro } from './about-intro';
import { approachSplitData, createApproachSplit } from './approach-split';
import { approachStepsData, createApproachSteps } from './approach-steps';
import { articleGridData, createArticleGrid } from './article-grid';
import { audienceListData, createAudienceList } from './audience-list';
import { capabilityPanelsData, createCapabilityPanels } from './capability-panels';
import { blockBase, type Background } from './common';
import { contactBandData, createContactBand } from './contact-band';
import { createCtaBand, ctaBandData } from './cta-band';
import { createFactStrip, factStripData } from './fact-strip';
import { createFrameworkStrip, frameworkStripData } from './framework-strip';
import { createHeroFramed, heroFramedData } from './hero-framed';
import { createImageBlock, imageBlockData } from './image';
import { createMissionVision, missionVisionData } from './mission-vision';
import { createPageHeader, pageHeaderData } from './page-header';
import { createRichText, richTextData } from './rich-text';
import { createServiceCarousel, serviceCarouselData } from './service-carousel';
import { createSplitImage, splitImageData } from './split-image';
import { createTopicList, topicListData } from './topic-list';
import { createValuesGrid, valuesGridData } from './values-grid';
import { createWhyGrid, whyGridData } from './why-grid';

export { BACKGROUNDS, type Background } from './common';

/**
 * The closed block palette (DS v3 §9). One entry per type: its data schema, a factory for a new empty block, a label
 * and one line of help for the admin, and the background it starts with. Adding a type means adding it here and in
 * the public and admin registries — the discriminated union below makes forgetting one a type error.
 */
export const PALETTE = {
  pageHeader: {
    data: pageHeaderData,
    create: createPageHeader,
    label: 'Page header',
    bg: 'surface',
    help: 'Framed banner at the top of an inner page.',
  },
  heroFramed: {
    data: heroFramedData,
    create: createHeroFramed,
    label: 'Hero (framed photo)',
    bg: 'bg',
    help: 'Navy photo hero with the lattice. Home only.',
  },
  capabilityPanels: {
    data: capabilityPanelsData,
    create: createCapabilityPanels,
    label: 'Capability panels',
    bg: 'bg',
    help: 'Three navy panels overlapping the hero above.',
  },
  aboutIntro: {
    data: aboutIntroData,
    create: createAboutIntro,
    label: 'About intro',
    bg: 'bg',
    help: 'Heading and paragraphs. A fact strip placed right after it sits beside it.',
  },
  factStrip: {
    data: factStripData,
    create: createFactStrip,
    label: 'Fact strip',
    bg: 'bg',
    help: 'Up to four client-approved numbers. Hidden until approved.',
  },
  frameworkStrip: {
    data: frameworkStripData,
    create: createFrameworkStrip,
    label: 'Framework strip',
    bg: 'bg',
    help: 'The frameworks you advise on, from the Frameworks collection.',
  },
  serviceCarousel: {
    data: serviceCarouselData,
    create: createServiceCarousel,
    label: 'Service carousel / grid',
    bg: 'bg',
    help: 'Service cards from the Services collection.',
  },
  approachSplit: {
    data: approachSplitData,
    create: createApproachSplit,
    label: 'Approach (photo + steps)',
    bg: 'bg',
    help: 'Photo with a round badge, numbered steps beside it.',
  },
  approachSteps: {
    data: approachStepsData,
    create: createApproachSteps,
    label: 'Approach steps',
    bg: 'surface',
    help: 'Numbered steps without a photo.',
  },
  audienceList: {
    data: audienceListData,
    create: createAudienceList,
    label: 'Audience list',
    bg: 'surface',
    help: 'Who you serve, with a photo and a question panel.',
  },
  splitImage: {
    data: splitImageData,
    create: createSplitImage,
    label: 'Text and image',
    bg: 'bg',
    help: 'Rich text beside a large photo.',
  },
  whyGrid: {
    data: whyGridData,
    create: createWhyGrid,
    label: 'Why grid',
    bg: 'bg',
    help: 'Heading cell plus reasons in a hairline grid.',
  },
  valuesGrid: {
    data: valuesGridData,
    create: createValuesGrid,
    label: 'Values grid',
    bg: 'bg',
    help: 'Heading above icon cells.',
  },
  missionVision: {
    data: missionVisionData,
    create: createMissionVision,
    label: 'Mission and vision',
    bg: 'surface',
    help: 'Two statements side by side.',
  },
  topicList: {
    data: topicListData,
    create: createTopicList,
    label: 'Topic list',
    bg: 'bg',
    help: 'Insight topics as chips.',
  },
  articleGrid: {
    data: articleGridData,
    create: createArticleGrid,
    label: 'Article grid',
    bg: 'bg',
    help: 'Latest published articles (hidden when there are none) or the full index.',
  },
  richText: {
    data: richTextData,
    create: createRichText,
    label: 'Rich text',
    bg: 'bg',
    help: 'Formatted text: prose column or two-column checklist.',
  },
  image: {
    data: imageBlockData,
    create: createImageBlock,
    label: 'Image',
    bg: 'bg',
    help: 'One photo from the media library.',
  },
  ctaBand: {
    data: ctaBandData,
    create: createCtaBand,
    label: 'Call-to-action band',
    bg: 'band',
    help: 'Heading, line and buttons on navy.',
  },
  contactBand: {
    data: contactBandData,
    create: createContactBand,
    label: 'Contact band',
    bg: 'bg',
    help: 'Heading, checklist and the enquiry form.',
  },
} as const satisfies Record<
  string,
  { data: z.ZodType; create: () => unknown; label: string; bg: Background; help: string }
>;

export type BlockType = keyof typeof PALETTE;
export const BLOCK_TYPES = Object.keys(PALETTE) as BlockType[];

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ ...blockBase, type: z.literal('pageHeader'), data: pageHeaderData }),
  z.object({ ...blockBase, type: z.literal('heroFramed'), data: heroFramedData }),
  z.object({ ...blockBase, type: z.literal('capabilityPanels'), data: capabilityPanelsData }),
  z.object({ ...blockBase, type: z.literal('aboutIntro'), data: aboutIntroData }),
  z.object({ ...blockBase, type: z.literal('factStrip'), data: factStripData }),
  z.object({ ...blockBase, type: z.literal('frameworkStrip'), data: frameworkStripData }),
  z.object({ ...blockBase, type: z.literal('serviceCarousel'), data: serviceCarouselData }),
  z.object({ ...blockBase, type: z.literal('approachSplit'), data: approachSplitData }),
  z.object({ ...blockBase, type: z.literal('approachSteps'), data: approachStepsData }),
  z.object({ ...blockBase, type: z.literal('audienceList'), data: audienceListData }),
  z.object({ ...blockBase, type: z.literal('splitImage'), data: splitImageData }),
  z.object({ ...blockBase, type: z.literal('whyGrid'), data: whyGridData }),
  z.object({ ...blockBase, type: z.literal('valuesGrid'), data: valuesGridData }),
  z.object({ ...blockBase, type: z.literal('missionVision'), data: missionVisionData }),
  z.object({ ...blockBase, type: z.literal('topicList'), data: topicListData }),
  z.object({ ...blockBase, type: z.literal('articleGrid'), data: articleGridData }),
  z.object({ ...blockBase, type: z.literal('richText'), data: richTextData }),
  z.object({ ...blockBase, type: z.literal('image'), data: imageBlockData }),
  z.object({ ...blockBase, type: z.literal('ctaBand'), data: ctaBandData }),
  z.object({ ...blockBase, type: z.literal('contactBand'), data: contactBandData }),
]);
export type Block = z.infer<typeof blockSchema>;
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;
export type BlockData<T extends BlockType> = BlockOf<T>['data'];

export function newBlock<T extends BlockType>(type: T, id: string): BlockOf<T> {
  const entry = PALETTE[type];
  return {
    id,
    type,
    anchorId: '',
    background: entry.bg,
    visible: true,
    data: entry.create(),
  } as BlockOf<T>;
}

/** A copy with a new id — the admin "duplicate" action. */
export function duplicateBlock(block: Block, id: string): Block {
  return { ...structuredClone(block), id, anchorId: '' };
}

export * from './about-intro';
export * from './approach-split';
export * from './approach-steps';
export * from './article-grid';
export * from './audience-list';
export * from './capability-panels';
export * from './contact-band';
export * from './cta-band';
export * from './fact-strip';
export * from './framework-strip';
export * from './hero-framed';
export * from './image';
export * from './mission-vision';
export * from './page-header';
export * from './rich-text';
export * from './service-carousel';
export * from './split-image';
export * from './topic-list';
export * from './values-grid';
export * from './why-grid';
