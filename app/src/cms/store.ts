import { redis } from './redis';
import { keys } from './keys';
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
import { sha256Hex } from '@/lib/token-hash';

/**
 * The data-access layer over Redis. Every read parses with the matching zod schema — a value written by an
 * older shape of this module, or edited by hand in the Upstash console, fails loudly here rather than reaching
 * a component as `any`. Edge-safe: no Node-only imports, so `src/middleware.ts` can use `getAvailability` and
 * `getSession` directly.
 */

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const RESET_TTL = 60 * 30;

/** Enquiry records expire automatically; override with SUBMISSION_RETENTION_DAYS (default 365). */
const SUBMISSION_RETENTION_SECONDS =
  Math.max(1, Number.parseInt(process.env.SUBMISSION_RETENTION_DAYS ?? '365', 10) || 365) *
  60 *
  60 *
  24;

async function sessionKey(token: string): Promise<string> {
  return keys.session(await sha256Hex(token));
}

async function resetKey(token: string): Promise<string> {
  return keys.reset(await sha256Hex(token));
}

// --- Availability --------------------------------------------------------------------------------------------

export async function getAvailability(): Promise<Availability | null> {
  const raw = await redis().get(keys.availability);
  if (!raw) return null;
  return availabilitySchema.parse(raw);
}

export async function setAvailability(value: Availability): Promise<void> {
  await redis().set(keys.availability, value);
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
  const digest = await sha256Hex(token);
  await r.set(keys.session(digest), session, { ex: SEVEN_DAYS });
  await r.sadd(keys.sessionsIndex, digest);
}

export async function getSession(token: string): Promise<Session | null> {
  const raw = await redis().get(await sessionKey(token));
  if (!raw) return null;
  return sessionSchema.parse(raw);
}

export async function deleteSession(token: string): Promise<void> {
  const r = redis();
  const digest = await sha256Hex(token);
  await r.del(keys.session(digest));
  await r.srem(keys.sessionsIndex, digest);
}

/** Invalidates every session — used on password change/reset so a stolen cookie stops working immediately. */
export async function deleteAllSessions(): Promise<void> {
  const r = redis();
  const digests = await r.smembers<string[]>(keys.sessionsIndex);
  if (digests.length > 0) await r.del(...digests.map((d) => keys.session(d)));
  await r.del(keys.sessionsIndex);
}

export const SESSION_MAX_AGE_SECONDS = SEVEN_DAYS;

// --- Password reset --------------------------------------------------------------------------------------------

export async function createResetToken(token: string, value: ResetToken): Promise<void> {
  await redis().set(await resetKey(token), value, { ex: RESET_TTL });
}

/** One-time use: GETDEL so a token cannot be replayed even under concurrent requests. */
export async function consumeResetToken(token: string): Promise<ResetToken | null> {
  const raw = await redis().getdel(await resetKey(token));
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

export async function listAllArticles(): Promise<ArticleDoc[]> {
  const [published, drafts] = await Promise.all([listPublishedSlugs(500), listDraftSlugs()]);
  const slugs = [...published, ...drafts];
  if (slugs.length === 0) return [];
  const docs = await redis().mget<unknown[]>(...slugs.map((s) => keys.article(s)));
  return docs.filter((d): d is object => d != null).map((d) => articleDocSchema.parse(d));
}

// --- Submissions -------------------------------------------------------------------------------------------

export async function putSubmission(submission: Submission): Promise<void> {
  const r = redis();
  await r.set(keys.submission(submission.id), submission, { ex: SUBMISSION_RETENTION_SECONDS });
  await r.zadd(keys.submissionsIndex, {
    score: Date.parse(submission.createdAt),
    member: submission.id,
  });
  if (submission.status === 'unread') await r.incr(keys.submissionsUnreadCount);
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
  const r = redis();
  await r.set(keys.submission(id), updated, { ex: SUBMISSION_RETENTION_SECONDS });
  if (existing.status === 'unread' && status !== 'unread')
    await r.decr(keys.submissionsUnreadCount);
  if (existing.status !== 'unread' && status === 'unread')
    await r.incr(keys.submissionsUnreadCount);
  return updated;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const existing = await getSubmission(id);
  if (!existing) return false;
  const r = redis();
  await r.del(keys.submission(id));
  await r.zrem(keys.submissionsIndex, id);
  if (existing.status === 'unread') await r.decr(keys.submissionsUnreadCount);
  return true;
}

/** Most recent first. */
export async function listSubmissions(limit = 200): Promise<Submission[]> {
  const ids = await redis().zrange<string[]>(keys.submissionsIndex, 0, limit - 1, { rev: true });
  if (ids.length === 0) return [];
  const docs = await redis().mget<unknown[]>(...ids.map((id) => keys.submission(id)));
  return docs.filter((d): d is object => d != null).map((d) => submissionSchema.parse(d));
}

export async function countSubmissions(): Promise<{ total: number; unread: number }> {
  const r = redis();
  const total = await r.zcard(keys.submissionsIndex);
  const unreadRaw = await r.get<number>(keys.submissionsUnreadCount);
  if (typeof unreadRaw === 'number' && unreadRaw >= 0) return { total, unread: unreadRaw };
  if (total === 0) return { total: 0, unread: 0 };
  const sample = await listSubmissions(Math.min(total, 500));
  return { total, unread: sample.filter((s) => s.status === 'unread').length };
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
