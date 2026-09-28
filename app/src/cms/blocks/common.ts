import { z } from 'zod';
import { hrefSchema, linkSchema, optionalTextSchema, textSchema } from '../fields';
import { ICON_NAMES } from '../collections/icons';
import { mediaRefSchema } from '../collections/media';

export { hrefSchema, linkSchema, optionalTextSchema, textSchema, mediaRefSchema };

/** DS v3 §9: every block stores these, whatever its type. Admin can change them; it cannot add styling. */
export const BACKGROUNDS = ['bg', 'surface', 'band'] as const;
export type Background = (typeof BACKGROUNDS)[number];

export const blockBase = {
  id: z.string().min(1),
  /** In-page anchor (#about). Empty = none. */
  anchorId: z
    .string()
    .trim()
    .regex(
      /^([a-z][a-z0-9-]{0,40})?$/,
      'Lowercase letters, numbers and hyphens, starting with a letter',
    ),
  background: z.enum(BACKGROUNDS),
  visible: z.boolean(),
};

export const iconSchema = z.enum(ICON_NAMES);
export const optionalLinkSchema = linkSchema.nullable();
export const titleTextSchema = z.object({ title: textSchema, text: textSchema });
export const iconItemSchema = z.object({ icon: iconSchema, title: textSchema, text: textSchema });
