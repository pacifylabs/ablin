import type { BlockOf, BlockType } from '@/cms/blocks';

/** Request-level context a block may need (the Insights index topic filter, the page's own title). */
export interface RenderContext {
  topic?: string;
  pageTitle?: string;
  /** Set by the renderer when a capabilityPanels block directly follows a heroFramed block. */
  overlapHero?: boolean;
}

export interface BlockProps<T extends BlockType> {
  block: BlockOf<T>;
  ctx: RenderContext;
}
