import { z } from 'zod';
import { redis } from './redis';
import { keys } from './keys';
import { frameworkSchema, type Framework } from '@/content/schema';
import {
  type AdminUser,
  type Availability,
  type PageDoc,
  type PageSlug,
  type ArticleDoc,
  type ResetToken,
  type Session,
  type Submission,
  type SubmissionStatus,
  adminUserSchema,
  articleDocSchema,
  availabilitySchema,
  pageDocSchema,
  resetTokenSchema,
  sessionSchema,
  submissionSchema,
} from './schema';
import { seedFrameworks, seedPage } from './seed-data';

/**
 * The data-access layer over Redis. Every read parses with the matching zod schema — a value written by an
 * older shape of this module, or edited by hand in the Upstash console, fails loudly here rather than reaching
 * a component as `any`. Edge-safe: no Node-only imports, so `src/middleware.ts` can use `getAvailability` and
 * `getSession` directly.
 */

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const RESET_TTL = 60 * 30;

// --- Availability --------------------------------------------------------------------------------------------

export async function getAvailability(): Promise<Availability | null> {
  const raw = await redis().get(keys.availability);
  if (!raw) return null;
  return availabilitySchema.parse(raw);
}

export async function setAvailability(value: Availability): Promise<void> {
  await redis().set(keys.availability, value);
}

// --- Frameworks (footer slider + frameworkIndex blocks' picker) ------------------------------------------------

export async function getFrameworks(): Promise<Framework[] | null> {
  const raw = await redis().get(keys.frameworks);
  if (!raw) return null;
  return z.array(frameworkSchema).parse(raw);
}

export async function putFrameworks(frameworks: readonly Framework[]): Promise<void> {
  await redis().set(keys.frameworks, frameworks);
}

/** What the footer slider, the frameworkIndex block picker and the public FrameworkBand all read: the
 *  admin-edited list, or — before it's ever been saved, or if Redis is briefly unreachable — the bundled
 *  starting content (content/frameworks.json via cms/seed-data.ts), the same fail-open pattern as
 *  getPageWithFallback below. */
export async function getFrameworksWithFallback(): Promise<readonly Framework[]> {
  try {
    return (await getFrameworks()) ?? seedFrameworks;
  } catch (error) {
    console.error(
      'Failed to read settings:frameworks from Redis; serving the bundled starting content instead.',
      error,
    );
    return seedFrameworks;
  }
}

// --- Admin user ------------------------------------------------------------------------------------------------

export async function getAdminUser(): Promise<AdminUser | null> {
  const raw = await redis().get(keys.adminUser);
  if (!raw) return null;
  return adminUserSchema.parse(raw);
}

export async function putAdminUser(user: AdminUser): Promise<void> {
  await redis().set(keys.adminUser, user);
}

// --- Sessions --------------------------------------------------------------------------------------------------

export async function createSession(token: string, session: Session): Promise<void> {
  const r = redis();
  await r.set(keys.session(token), session, { ex: SEVEN_DAYS });
  await r.sadd(keys.sessionsIndex, token);
}

export async function getSession(token: string): Promise<Session | null> {
  const raw = await redis().get(keys.session(token));
  if (!raw) return null;
  return sessionSchema.parse(raw);
}

export async function deleteSession(token: string): Promise<void> {
  const r = redis();
  await r.del(keys.session(token));
  await r.srem(keys.sessionsIndex, token);
}

/** Invalidates every session — used on password change/reset so a stolen cookie stops working immediately. */
export async function deleteAllSessions(): Promise<void> {
  const r = redis();
  const tokens = await r.smembers<string[]>(keys.sessionsIndex);
  if (tokens.length > 0) await r.del(...tokens.map((t) => keys.session(t)));
  await r.del(keys.sessionsIndex);
}

export const SESSION_MAX_AGE_SECONDS = SEVEN_DAYS;

// --- Password reset --------------------------------------------------------------------------------------------

export async function createResetToken(token: string, value: ResetToken): Promise<void> {
  await redis().set(keys.reset(token), value, { ex: RESET_TTL });
}

/** One-time use: reads and deletes atomically via a pipeline, so a token cannot be replayed. */
export async function consumeResetToken(token: string): Promise<ResetToken | null> {
  const r = redis();
  const pipeline = r.pipeline();
  pipeline.get(keys.reset(token));
  pipeline.del(keys.reset(token));
  const [raw] = (await pipeline.exec()) as [unknown, unknown];
  if (!raw) return null;
  return resetTokenSchema.parse(raw);
}

// --- Pages -----------------------------------------------------------------------------------------------------

export async function getPage(slug: string): Promise<PageDoc | null> {
  const raw = await redis().get(keys.page(slug));
  if (!raw) return null;
  return pageDocSchema.parse(raw);
}

export async function putPage(doc: PageDoc): Promise<void> {
  const r = redis();
  await r.set(keys.page(doc.slug), doc);
  await r.sadd(keys.pagesIndex, doc.slug);
}

export async function listPageSlugs(): Promise<PageSlug[]> {
  const slugs = await redis().smembers<string[]>(keys.pagesIndex);
  return slugs as PageSlug[];
}

/**
 * What every public page.tsx reads (see cms/seed-data.ts): the live page:{slug} document, or — when Redis has
 * never been seeded (page:{slug} doesn't exist yet) or is briefly unreachable — the bundled starting content,
 * so neither a fresh deployment nor a transient Redis outage ever takes the public site down. A page that DOES
 * exist in Redis is always used as-is, even mid-edit; only a missing key or a genuine error falls back.
 */
export async function getPageWithFallback(slug: PageSlug): Promise<PageDoc> {
  try {
    return (await getPage(slug)) ?? seedPage(slug);
  } catch (error) {
    console.error(
      `Failed to read page:${slug} from Redis; serving the bundled starting content instead.`,
      error,
    );
    return seedPage(slug);
  }
}

export async function listPages(): Promise<PageDoc[]> {
  const slugs = await listPageSlugs();
  if (slugs.length === 0) return [];
  const docs = await redis().mget<unknown[]>(...slugs.map((s) => keys.page(s)));
  return docs.filter((d): d is object => d != null).map((d) => pageDocSchema.parse(d));
}

// --- Insights articles -------------------------------------------------------------------------------------

export async function getArticle(slug: string): Promise<ArticleDoc | null> {
  const raw = await redis().get(keys.article(slug));
  if (!raw) return null;
  return articleDocSchema.parse(raw);
}

export async function putArticle(doc: ArticleDoc): Promise<void> {
  await redis().set(keys.article(doc.slug), doc);
}

export async function deleteArticle(slug: string): Promise<void> {
  const r = redis();
  await r.del(keys.article(slug));
  await r.zrem(keys.articlesIndex, slug);
  await r.srem(keys.articleDrafts, slug);
}

export async function markArticleDraft(slug: string): Promise<void> {
  const r = redis();
  await r.sadd(keys.articleDrafts, slug);
  await r.zrem(keys.articlesIndex, slug);
}

export async function markArticlePublished(slug: string, publishedAt: number): Promise<void> {
  const r = redis();
  await r.srem(keys.articleDrafts, slug);
  await r.zadd(keys.articlesIndex, { score: publishedAt, member: slug });
}

/** Most recent first. */
export async function listPublishedSlugs(limit = 100): Promise<string[]> {
  return redis().zrange<string[]>(keys.articlesIndex, 0, limit - 1, { rev: true });
}

export async function listDraftSlugs(): Promise<string[]> {
  return redis().smembers<string[]>(keys.articleDrafts);
}

export async function listPublishedArticles(limit = 100): Promise<ArticleDoc[]> {
  const slugs = await listPublishedSlugs(limit);
  if (slugs.length === 0) return [];
  const docs = await redis().mget<unknown[]>(...slugs.map((s) => keys.article(s)));
  return docs.filter((d): d is object => d != null).map((d) => articleDocSchema.parse(d));
}

/** Public-read equivalents of getArticle/listPublishedArticles: degrade to "nothing published" rather than a
 *  500 if Redis is briefly unreachable, the same fail-open reasoning as getPageWithFallback above. Only for the
 *  public /insights routes — the admin editor uses getArticle/listAllArticles directly and should fail loudly. */
export async function getPublishedArticle(slug: string): Promise<ArticleDoc | null> {
  try {
    const article = await getArticle(slug);
    return article && article.status === 'published' ? article : null;
  } catch (error) {
    console.error(`Failed to read insights:article:${slug} from Redis.`, error);
    return null;
  }
}

export async function listPublishedArticlesSafe(limit = 100): Promise<ArticleDoc[]> {
  try {
    return await listPublishedArticles(limit);
  } catch (error) {
    console.error('Failed to list published articles from Redis.', error);
    return [];
  }
}

export async function listAllArticles(): Promise<ArticleDoc[]> {
  const [published, drafts] = await Promise.all([listPublishedSlugs(500), listDraftSlugs()]);
  const slugs = [...published, ...drafts];
  if (slugs.length === 0) return [];
  const docs = await redis().mget<unknown[]>(...slugs.map((s) => keys.article(s)));
  return docs.filter((d): d is object => d != null).map((d) => articleDocSchema.parse(d));
}

export async function addTopics(topics: readonly string[]): Promise<void> {
  const [first, ...rest] = topics;
  if (!first) return;
  await redis().sadd(keys.topicsIndex, first, ...rest);
}

export async function listTopics(): Promise<string[]> {
  return redis().smembers<string[]>(keys.topicsIndex);
}

// --- Submissions -------------------------------------------------------------------------------------------

export async function putSubmission(submission: Submission): Promise<void> {
  const r = redis();
  await r.set(keys.submission(submission.id), submission);
  await r.zadd(keys.submissionsIndex, {
    score: Date.parse(submission.createdAt),
    member: submission.id,
  });
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const raw = await redis().get(keys.submission(id));
  if (!raw) return null;
  return submissionSchema.parse(raw);
}

export async function setSubmissionStatus(
  id: string,
  status: SubmissionStatus,
): Promise<Submission | null> {
  const existing = await getSubmission(id);
  if (!existing) return null;
  const updated: Submission = { ...existing, status };
  await redis().set(keys.submission(id), updated);
  return updated;
}

/** Most recent first. */
export async function listSubmissions(limit = 200): Promise<Submission[]> {
  const ids = await redis().zrange<string[]>(keys.submissionsIndex, 0, limit - 1, { rev: true });
  if (ids.length === 0) return [];
  const docs = await redis().mget<unknown[]>(...ids.map((id) => keys.submission(id)));
  return docs.filter((d): d is object => d != null).map((d) => submissionSchema.parse(d));
}

export async function countSubmissions(): Promise<{ total: number; unread: number }> {
  const all = await listSubmissions(1000);
  return { total: all.length, unread: all.filter((s) => s.status === 'unread').length };
}

// --- Rate limiting -----------------------------------------------------------------------------------------

/**
 * Fixed-window counter shared across every serverless instance (the in-memory limiter in lib/rate-limit.ts
 * cannot be, on Vercel). Returns the new count for the current window; the caller compares it to its own limit.
 */
export async function incrementRateLimit(
  scope: string,
  identity: string,
  windowSeconds: number,
): Promise<number> {
  const r = redis();
  const key = keys.rateLimit(scope, identity);
  const count = await r.incr(key);
  if (count === 1) await r.expire(key, windowSeconds);
  return count;
}
