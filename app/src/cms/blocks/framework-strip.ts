import { z } from 'zod';
import { optionalTextSchema } from './common';

/** DS v3 §7.6. `strip` = the row of marks; `index` = cards with publisher and source links. */
export const frameworkStripData = z.object({
  variant: z.enum(['strip', 'index']),
  eyebrow: optionalTextSchema,
  title: optionalTextSchema,
  /** Framework ids from the collection, in order. Empty = all. */
  frameworkIds: z.array(z.string()),
  caption: optionalTextSchema,
  /** Screen-reader suffix for source links that open a new tab (index variant). */
  newTabLabel: optionalTextSchema,
});
export type FrameworkStripData = z.infer<typeof frameworkStripData>;
export const createFrameworkStrip = (): FrameworkStripData => ({
  variant: 'strip',
  eyebrow: '',
  title: '',
  frameworkIds: [],
  caption: '',
  newTabLabel: '',
});
