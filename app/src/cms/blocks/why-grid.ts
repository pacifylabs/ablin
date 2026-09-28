import { z } from 'zod';
import { iconItemSchema, optionalTextSchema, textSchema } from './common';

/** DS v3 §7.10: 3×2 hairline grid, heading block in the first cell. */
export const whyGridData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  intro: optionalTextSchema,
  items: z.array(iconItemSchema).min(1).max(8),
});
export type WhyGridData = z.infer<typeof whyGridData>;
export const createWhyGrid = (): WhyGridData => ({
  eyebrow: '',
  title: '',
  intro: '',
  items: [{ icon: 'shield', title: '', text: '' }],
});
