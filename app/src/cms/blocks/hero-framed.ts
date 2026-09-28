import { z } from 'zod';
import {
  linkSchema,
  mediaRefSchema,
  optionalLinkSchema,
  optionalTextSchema,
  textSchema,
} from './common';

/** DS v3 §7.3: framed navy photo hero with the lattice. */
export const heroFramedData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  lead: optionalTextSchema,
  image: mediaRefSchema.nullable(),
  /** Small letter-spaced tag, top right (e.g. UNITED KINGDOM). Empty = none. */
  locationTag: optionalTextSchema,
  primaryCta: linkSchema,
  secondaryCta: optionalLinkSchema,
  lattice: z.boolean(),
});
export type HeroFramedData = z.infer<typeof heroFramedData>;
export const createHeroFramed = (): HeroFramedData => ({
  eyebrow: '',
  title: '',
  lead: '',
  image: null,
  locationTag: '',
  primaryCta: { label: '', href: '/contact' },
  secondaryCta: null,
  lattice: true,
});
