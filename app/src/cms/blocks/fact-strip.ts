import { z } from 'zod';
import { textSchema } from './common';

/**
 * DS v3 §7.5 integrity rule: facts must be true, client-approved counts. Nothing renders until `approvedByClient`
 * is ticked, so an unapproved number can never reach the live site.
 */
export const factStripData = z.object({
  facts: z
    .array(z.object({ value: textSchema.max(8), label: textSchema }))
    .min(1)
    .max(4),
  approvedByClient: z.boolean(),
});
export type FactStripData = z.infer<typeof factStripData>;
export const createFactStrip = (): FactStripData => ({
  facts: [{ value: '', label: '' }],
  approvedByClient: false,
});
