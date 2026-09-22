import { z } from 'zod';
import {
  addTopics,
  deleteArticle,
  getArticle,
  listAllArticles,
  markArticleDraft,
  markArticlePublished,
  putArticle,
} from '@/cms/store';
import { blockImageSchema, blockSchema, type ArticleDoc } from '@/cms/schema';
import { findBlockReferenceError } from '@/cms/validate-blocks';
import { isSameOrigin, json } from '@/admin/http';

export async function handleListInsights(): Promise<Response> {
  const articles = await listAllArticles();
  return json(
    articles
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        status: a.status,
        publishedAt: a.publishedAt,
        updatedAt: a.updatedAt,
        hasDraft: Boolean(a.draft),
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    200,
  );
}

export async function handleGetInsight(slug: string): Promise<Response> {
  const article = await getArticle(slug);
  if (!article) return json({ error: 'not_found' }, 404);
  return json(article, 200);
}

const editableFields = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  coverImage: blockImageSchema.optional(),
  topics: z.array(z.string().min(1)),
  blocks: z.array(blockSchema),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
});

const createSchema = editableFields.extend({ slug: z.string().regex(/^[a-z0-9-]+$/) });

export async function handleCreateInsight(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success)
    return json({ error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  const referenceError = await findBlockReferenceError(parsed.data.blocks);
  if (referenceError) return json({ error: 'invalid_reference', message: referenceError }, 422);

  if (await getArticle(parsed.data.slug)) return json({ error: 'slug_taken' }, 409);

  const { slug, ...fields } = parsed.data;
  const now = new Date().toISOString();
  const doc: ArticleDoc = { slug, ...fields, status: 'draft', updatedAt: now };
  await putArticle(doc);
  await markArticleDraft(slug);
  await addTopics(fields.topics);
  return json(doc, 201);
}

export async function handleUpdateInsight(request: Request, slug: string): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  const existing = await getArticle(slug);
  if (!existing) return json({ error: 'not_found' }, 404);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = editableFields.safeParse(payload);
  if (!parsed.success)
    return json({ error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  const referenceError = await findBlockReferenceError(parsed.data.blocks);
  if (referenceError) return json({ error: 'invalid_reference', message: referenceError }, 422);

  const now = new Date().toISOString();
  const doc: ArticleDoc =
    existing.status === 'published'
      ? { ...existing, draft: { ...parsed.data, updatedAt: now } }
      : { ...existing, ...parsed.data, updatedAt: now };

  await putArticle(doc);
  await addTopics(parsed.data.topics);
  return json(doc, 200);
}

export async function handleDeleteInsight(request: Request, slug: string): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);
  const existing = await getArticle(slug);
  if (!existing) return json({ error: 'not_found' }, 404);
  await deleteArticle(slug);
  return json({ ok: true }, 200);
}

export async function handlePublishInsight(request: Request, slug: string): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);
  const existing = await getArticle(slug);
  if (!existing) return json({ error: 'not_found' }, 404);

  const now = new Date().toISOString();
  let doc: ArticleDoc;
  if (existing.status === 'published') {
    // Already live: promote any staged draft edits without disturbing publishedAt.
    if (!existing.draft) return json(existing, 200);
    doc = { ...existing, ...existing.draft, updatedAt: now, draft: undefined };
  } else {
    doc = { ...existing, status: 'published', publishedAt: now, updatedAt: now, draft: undefined };
  }
  await putArticle(doc);
  await markArticlePublished(slug, Date.parse(doc.publishedAt ?? now));
  return json(doc, 200);
}

export async function handleUnpublishInsight(request: Request, slug: string): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);
  const existing = await getArticle(slug);
  if (!existing) return json({ error: 'not_found' }, 404);
  const doc: ArticleDoc = {
    ...existing,
    status: 'draft',
    publishedAt: undefined,
    updatedAt: new Date().toISOString(),
  };
  await putArticle(doc);
  await markArticleDraft(slug);
  return json(doc, 200);
}
