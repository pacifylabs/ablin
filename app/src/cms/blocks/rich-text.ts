import { z } from 'zod';
import { richDocSchema, EMPTY_DOC } from '../richdoc';
import { optionalTextSchema } from './common';

/** `prose` = 760px reading column (legal, articles); `checklist` = bullet lists as a two-column checklist. */
export const richTextData = z.object({
  title: optionalTextSchema,
  /** Small line under the title, e.g. "Last updated 1 June 2026". */
  meta: optionalTextSchema,
  doc: richDocSchema,
  layout: z.enum(['prose', 'checklist']),
});
export type RichTextData = z.infer<typeof richTextData>;
export const createRichText = (): RichTextData => ({
  title: '',
  meta: '',
  doc: EMPTY_DOC,
  layout: 'prose',
});
