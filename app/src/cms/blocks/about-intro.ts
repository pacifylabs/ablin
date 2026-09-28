import { z } from 'zod';
import { optionalTextSchema, textSchema } from './common';

/** DS v3 §7.5 (left column). A factStrip placed directly after it renders beside it. */
export const aboutIntroData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  paragraphs: z.array(textSchema).min(1).max(3),
});
export type AboutIntroData = z.infer<typeof aboutIntroData>;
export const createAboutIntro = (): AboutIntroData => ({
  eyebrow: '',
  title: '',
  paragraphs: [''],
});
