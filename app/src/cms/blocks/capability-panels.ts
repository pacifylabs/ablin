import { z } from 'zod';
import { iconSchema, linkSchema, textSchema } from './common';

/** DS v3 §7.4: three navy glass panels overlapping the hero above. */
export const capabilityPanelsData = z.object({
  panels: z
    .array(z.object({ icon: iconSchema, title: textSchema, text: textSchema, link: linkSchema }))
    .min(1)
    .max(3),
});
export type CapabilityPanelsData = z.infer<typeof capabilityPanelsData>;
export const createCapabilityPanels = (): CapabilityPanelsData => ({
  panels: [{ icon: 'square-check', title: '', text: '', link: { label: '', href: '/services' } }],
});
