import { z } from 'zod';
import { linkSchema, mediaRefSchema, optionalTextSchema, textSchema } from './common';

/** DS v3 §7.9: audiences on the left; tall photo with a floating question panel on the right. */
export const audienceListData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  lead: optionalTextSchema,
  items: z
    .array(
      z.object({
        title: textSchema,
        text: textSchema,
        /** Optional in-page anchor so other pages can link to this audience. */
        anchorId: z
          .string()
          .trim()
          .regex(/^([a-z][a-z0-9-]{0,40})?$/),
      }),
    )
    .min(1),
  image: mediaRefSchema.nullable(),
  note: z.object({ title: textSchema, text: optionalTextSchema, cta: linkSchema }).nullable(),
});
export type AudienceListData = z.infer<typeof audienceListData>;
export const createAudienceList = (): AudienceListData => ({
  eyebrow: '',
  title: '',
  lead: '',
  items: [{ title: '', text: '', anchorId: '' }],
  image: null,
  note: null,
});
