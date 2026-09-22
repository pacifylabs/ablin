import { z } from 'zod';
import { getPage, listPages, putPage } from '@/cms/store';
import { blockSchema, PAGE_SLUGS, type PageDoc } from '@/cms/schema';
import { findBlockReferenceError } from '@/cms/validate-blocks';
import { isSameOrigin, json } from '@/admin/http';

export async function handleListPages(): Promise<Response> {
  const pages = await listPages();
  return json(
    pages
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        status: p.status,
        updatedAt: p.updatedAt,
        hasDraft: Boolean(p.draft),
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
    200,
  );
}

export async function handleGetPage(slug: string): Promise<Response> {
  const page = await getPage(slug);
  if (!page) return json({ error: 'not_found' }, 404);
  return json(page, 200);
}

const putSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  ogImage: z.string(),
  blocks: z.array(blockSchema),
  /** true = write straight to the live page; false = stage as an unpublished draft (see cms/schema.ts PageDoc). */
  publish: z.boolean(),
});

/**
 * A page's slug is fixed by which route reads it (see PAGE_SLUGS) — there is no "create a page" flow, so this
 * is the only write endpoint pages need. `publish: false` never touches what the public site currently renders.
 */
export async function handlePutPage(request: Request, slug: string): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);
  if (!(PAGE_SLUGS as readonly string[]).includes(slug))
    return json({ error: 'unknown_page' }, 404);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = putSchema.safeParse(payload);
  if (!parsed.success)
    return json({ error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  const referenceError = await findBlockReferenceError(parsed.data.blocks);
  if (referenceError) return json({ error: 'invalid_reference', message: referenceError }, 422);

  const existing = await getPage(slug);
  const now = new Date().toISOString();
  const fields = {
    title: parsed.data.title,
    seoTitle: parsed.data.seoTitle,
    seoDescription: parsed.data.seoDescription,
    ogImage: parsed.data.ogImage,
    blocks: parsed.data.blocks,
  };

  const doc: PageDoc = parsed.data.publish
    ? { slug, ...fields, status: 'published', updatedAt: now, draft: undefined }
    : existing && existing.status === 'published'
      ? { ...existing, draft: { ...fields, updatedAt: now } }
      : { slug, ...fields, status: 'draft', updatedAt: now };

  await putPage(doc);
  return json(doc, 200);
}
