import { z } from 'zod';
import { richDocSchema, EMPTY_DOC } from '../richdoc';
import { mediaRefSchema, optionalLinkSchema, optionalTextSchema, textSchema } from './common';

/** Text beside a large photo (DS v3 reference B "overview"). */
export const splitImageData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  body: richDocSchema,
  image: mediaRefSchema.nullable(),
  imageSide: z.enum(['left', 'right']),
  cta: optionalLinkSchema,
});
export type SplitImageData = z.infer<typeof splitImageData>;
export const createSplitImage = (): SplitImageData => ({
  eyebrow: '',
  title: '',
  body: EMPTY_DOC,
  image: null,
  imageSide: 'right',
  cta: null,
});
