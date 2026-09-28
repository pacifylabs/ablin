import { z } from 'zod';
import { optionalTextSchema, textSchema } from './common';

/**
 * DS v3 §7.12: band panel with heading, sub, checklist and the enquiry form. Form labels, enquiry types and messages
 * come from `settings:contact`. Checklist lines must be client-approved text.
 */
export const contactBandData = z.object({
  title: textSchema,
  sub: optionalTextSchema,
  checklist: z.array(textSchema).max(5),
});
export type ContactBandData = z.infer<typeof contactBandData>;
export const createContactBand = (): ContactBandData => ({ title: '', sub: '', checklist: [] });
