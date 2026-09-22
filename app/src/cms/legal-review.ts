import type { Block } from './schema';

/** Review status on a legal page's single textRich("document") block. */
export function getLegalReviewStatus(list: readonly Block[]): 'draft' | 'approved' {
  for (const b of list) {
    if (b.type === 'textRich' && b.data.variant === 'document') return b.data.reviewStatus;
  }
  return 'draft';
}
