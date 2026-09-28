import { z } from 'zod';

/**
 * Tiptap document (richText blocks and articles). Kept intentionally small: the marks/nodes the editor may produce are
 * exactly the ones richtext.tsx knows how to render, so a document can never describe markup outside the design system.
 */
export interface RichNode {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
  content?: RichNode[];
}

const richNodeSchema: z.ZodType<RichNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z
      .array(z.object({ type: z.string(), attrs: z.record(z.string(), z.unknown()).optional() }))
      .optional(),
    text: z.string().optional(),
    content: z.array(richNodeSchema).optional(),
  }),
);

export const richDocSchema = z.object({ type: z.literal('doc'), content: z.array(richNodeSchema) });
export type RichDoc = z.infer<typeof richDocSchema>;

export const EMPTY_DOC: RichDoc = { type: 'doc', content: [{ type: 'paragraph' }] };
