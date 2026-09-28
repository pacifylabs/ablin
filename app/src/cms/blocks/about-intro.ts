import { z } from 'zod';
import { mediaRefSchema, optionalTextSchema, textSchema } from './common';

/**
 * DS v3 §7.5 (left column). A factStrip placed directly after it renders beside it; without one, the optional photo
 * fills the right column.
 */
export const aboutIntroData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  paragraphs: z.array(textSchema).min(1).max(3),
  image: mediaRefSchema.nullable().default(null),
});
export type AboutIntroData = z.infer<typeof aboutIntroData>;
export const createAboutIntro = (): AboutIntroData => ({
  eyebrow: '',
  title: '',
  paragraphs: [''],
  image: null,
});
