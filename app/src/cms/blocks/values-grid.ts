import { z } from 'zod';
import { iconItemSchema, optionalTextSchema, textSchema } from './common';

/** Heading above a grid of icon + title + text cells (About values). */
export const valuesGridData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  lead: optionalTextSchema,
  items: z.array(iconItemSchema).min(1).max(9),
});
export type ValuesGridData = z.infer<typeof valuesGridData>;
export const createValuesGrid = (): ValuesGridData => ({
  eyebrow: '',
  title: '',
  lead: '',
  items: [{ icon: 'compass', title: '', text: '' }],
});
