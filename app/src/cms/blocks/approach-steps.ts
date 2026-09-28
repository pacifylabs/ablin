import { z } from 'zod';
import { optionalTextSchema, textSchema, titleTextSchema } from './common';

/** Numbered steps without the photo (services index, service detail). `compact` = tighter rows. */
export const approachStepsData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  lead: optionalTextSchema,
  steps: z.array(titleTextSchema).min(1).max(8),
  compact: z.boolean(),
});
export type ApproachStepsData = z.infer<typeof approachStepsData>;
export const createApproachSteps = (): ApproachStepsData => ({
  eyebrow: '',
  title: '',
  lead: '',
  steps: [{ title: '', text: '' }],
  compact: false,
});
