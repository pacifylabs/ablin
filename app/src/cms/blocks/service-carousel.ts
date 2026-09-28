import { z } from 'zod';
import { optionalTextSchema, textSchema } from './common';

/** DS v3 §7.7. Cards come from the services collection. */
export const serviceCarouselData = z.object({
  variant: z.enum(['carousel', 'grid']),
  eyebrow: optionalTextSchema,
  title: optionalTextSchema,
  lead: optionalTextSchema,
  /** Service slugs in order. Empty = all services in collection order. */
  serviceSlugs: z.array(z.string()),
  cardLinkLabel: textSchema,
  prevLabel: textSchema,
  nextLabel: textSchema,
  /** Accessible name of the scrollable track. */
  trackLabel: textSchema,
});
export type ServiceCarouselData = z.infer<typeof serviceCarouselData>;
export const createServiceCarousel = (): ServiceCarouselData => ({
  variant: 'carousel',
  eyebrow: '',
  title: '',
  lead: '',
  serviceSlugs: [],
  cardLinkLabel: '',
  prevLabel: '',
  nextLabel: '',
  trackLabel: '',
});
