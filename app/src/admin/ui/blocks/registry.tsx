'use client';

import type { Block, BlockType } from '@/cms/blocks';
import {
  AboutIntroForm,
  CapabilityPanelsForm,
  FactStripForm,
  FrameworkStripForm,
  HeroFramedForm,
  PageHeaderForm,
  ServiceCarouselForm,
} from './forms-a';
import {
  ApproachSplitForm,
  ApproachStepsForm,
  ArticleGridForm,
  AudienceListForm,
  ContactBandForm,
  CtaBandForm,
  ImageForm,
  MissionVisionForm,
  RichTextForm,
  SplitImageForm,
  TopicListForm,
  ValuesGridForm,
  WhyGridForm,
} from './forms-b';
import type { BlockRefs, FormProps } from './types';

type AnyForm = (props: FormProps<BlockType>) => React.ReactNode;

/** One admin form per block type (DS v3 §9). The `satisfies` makes a missing form a type error. */
const FORMS = {
  pageHeader: PageHeaderForm,
  heroFramed: HeroFramedForm,
  capabilityPanels: CapabilityPanelsForm,
  aboutIntro: AboutIntroForm,
  factStrip: FactStripForm,
  frameworkStrip: FrameworkStripForm,
  serviceCarousel: ServiceCarouselForm,
  approachSplit: ApproachSplitForm,
  approachSteps: ApproachStepsForm,
  audienceList: AudienceListForm,
  splitImage: SplitImageForm,
  whyGrid: WhyGridForm,
  valuesGrid: ValuesGridForm,
  missionVision: MissionVisionForm,
  topicList: TopicListForm,
  articleGrid: ArticleGridForm,
  richText: RichTextForm,
  image: ImageForm,
  ctaBand: CtaBandForm,
  contactBand: ContactBandForm,
} satisfies { [T in BlockType]: (props: FormProps<T>) => React.ReactNode };

export function BlockForm({
  block,
  onChange,
  refs,
}: {
  block: Block;
  onChange: (data: Block['data']) => void;
  refs: BlockRefs;
}) {
  const Form = FORMS[block.type] as AnyForm;
  return <Form data={block.data} onChange={onChange} refs={refs} />;
}

export type { BlockRefs };
