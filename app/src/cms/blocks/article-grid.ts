import { z } from 'zod';
import { optionalTextSchema, textSchema } from './common';

/**
 * DS v3 §7.11: latest published articles. `latest` renders nothing when there are none (never placeholder
 * articles); `all` is the Insights index and shows the empty-state copy instead.
 */
export const articleGridData = z.object({
  mode: z.enum(['latest', 'all']),
  eyebrow: optionalTextSchema,
  title: optionalTextSchema,
  lead: optionalTextSchema,
  count: z.number().int().min(1).max(12),
  readMoreLabel: textSchema,
  emptyTitle: optionalTextSchema,
  emptyText: optionalTextSchema,
  /** "Showing articles about {topic}" and the clear-filter link, on /insights/topic/{slug}. */
  filterLabel: optionalTextSchema,
  clearFilterLabel: optionalTextSchema,
});
export type ArticleGridData = z.infer<typeof articleGridData>;
export const createArticleGrid = (): ArticleGridData => ({
  mode: 'latest',
  eyebrow: '',
  title: '',
  lead: '',
  count: 3,
  readMoreLabel: '',
  emptyTitle: '',
  emptyText: '',
  filterLabel: '',
  clearFilterLabel: '',
});
