import { z } from 'zod';
import {
  linkSchema,
  mediaRefSchema,
  optionalTextSchema,
  textSchema,
  titleTextSchema,
} from './common';

/** DS v3 §7.8: heading + 4:5 photo with circular badge; numbered steps on the right. */
export const approachSplitData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  lead: optionalTextSchema,
  image: mediaRefSchema.nullable(),
  badge: linkSchema.nullable(),
  steps: z.array(titleTextSchema).min(1).max(8),
});
export type ApproachSplitData = z.infer<typeof approachSplitData>;
export const createApproachSplit = (): ApproachSplitData => ({
  eyebrow: '',
  title: '',
  lead: '',
  image: null,
  badge: null,
  steps: [{ title: '', text: '' }],
});
