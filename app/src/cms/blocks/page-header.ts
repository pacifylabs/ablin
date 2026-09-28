import { z } from 'zod';
import { mediaRefSchema, optionalLinkSchema, optionalTextSchema, textSchema } from './common';

/** DS v3 §7.14: inner-page framed banner. No image = plain `--surface` header (legal pages). */
export const pageHeaderData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  lead: optionalTextSchema,
  image: mediaRefSchema.nullable(),
  /** Home › this page, labels from navigation. */
  breadcrumb: z.boolean(),
  cta: optionalLinkSchema,
});
export type PageHeaderData = z.infer<typeof pageHeaderData>;
export const createPageHeader = (): PageHeaderData => ({
  eyebrow: '',
  title: '',
  lead: '',
  image: null,
  breadcrumb: true,
  cta: null,
});
