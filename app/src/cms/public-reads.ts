import { cachedQuery } from './cached';
import { keys } from './keys';
import { redis } from './redis';
import {
  LEGAL_PAGE_SLUGS,
  pageDocSchema,
  type ArticleDoc,
  type PageDoc,
  type PageSlug,
} from './schema';
import { seedPage } from './seed-data';
import { getArticle, listPublishedArticles } from './store';

/**
 * Cached reads for the public site, kept out of store.ts so the edge middleware (which imports store.ts) never
 * bundles the seed pages or Next's data cache.
 */

/**
 * The public read of a page: cached under the tag `page:{slug}` (expired by every admin save), so pages render
 * statically. A missing key, or a stored document from an older schema, serves the bundled page; a Redis error does
 * too, except for legal pages, which fail loudly rather than show unreviewed bundled copy.
 */
export async function getPublicPage(slug: PageSlug): Promise<PageDoc> {
  let raw: unknown;
  try {
    raw = await cachedQuery(
      [keys.page(slug)],
      ['page', slug],
      async () => (await redis().get(keys.page(slug))) ?? null,
    );
  } catch (error) {
    if (LEGAL_PAGE_SLUGS.has(slug)) {
      console.error(
        `Failed to read legal page:${slug} from Redis; refusing bundled fallback.`,
        error,
      );
      throw error;
    }
    console.error(`Failed to read page:${slug} from Redis; serving the bundled page.`, error);
    return seedPage(slug);
  }
  if (raw === null) return seedPage(slug);
  const parsed = pageDocSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  console.error(
    `Stored page:${slug} does not match the current page schema; serving the bundled page.`,
  );
  return seedPage(slug);
}

/** Cached public reads, tagged `insights:index` / `insights:article:{slug}`; every article write expires both. */
export async function listPublishedArticlesCached(limit = 100): Promise<ArticleDoc[]> {
  try {
    return await cachedQuery([keys.articlesIndex], ['articles', String(limit)], () =>
      listPublishedArticles(limit),
    );
  } catch (error) {
    console.error('Failed to list published articles from Redis.', error);
    return [];
  }
}

export async function getPublishedArticleCached(slug: string): Promise<ArticleDoc | null> {
  try {
    return await cachedQuery(
      [keys.article(slug), keys.articlesIndex],
      ['article', slug],
      async () => {
        const article = await getArticle(slug);
        return article && article.status === 'published' ? article : null;
      },
    );
  } catch (error) {
    console.error(`Failed to read insights:article:${slug} from Redis.`, error);
    return null;
  }
}
