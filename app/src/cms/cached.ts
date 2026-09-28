import { revalidateTag, unstable_cache } from 'next/cache';
import { z } from 'zod';
import { RedisNotConfiguredError, isRedisConfigured, redis, reportReadFailure } from './redis';

/**
 * Public reads of admin-managed documents. Each Redis key is cached under a tag equal to the key itself, so a page
 * that reads it stays statically rendered, and an admin save expires exactly the keys it wrote (`expireKeys`).
 *
 * `{ expire: 0 }` matters: Next 16's `revalidateTag(tag, 'default')` is stale-while-revalidate, so the first reload
 * after a save would still show the old value. Expiring immediately gives read-your-own-writes in the admin.
 *
 * The time-based revalidate is only a safety net for writes that bypass the admin (the seed script, the Upstash
 * console).
 */
const SAFETY_REVALIDATE_SECONDS = 300;

async function fetchRaw(key: string): Promise<unknown> {
  return (await redis().get(key)) ?? null;
}

function cachedRaw(key: string): Promise<unknown> {
  // Without credentials there is nothing to cache; failing here keeps Next's data cache from logging a failed
  // revalidation per key during a build that has no Redis.
  if (!isRedisConfigured()) return Promise.reject(new RedisNotConfiguredError());
  return unstable_cache(() => fetchRaw(key), ['redis-doc', key], {
    tags: [key],
    revalidate: SAFETY_REVALIDATE_SECONDS,
  })();
}

/**
 * Read and validate one document. A missing key, an unreachable Redis or a document that fails validation all serve
 * `fallback` (the bundled seed copy) and log loudly, so the public site never renders empty or crashes on bad data.
 */
export async function readCached<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  let raw: unknown;
  try {
    raw = await cachedRaw(key);
  } catch (error) {
    reportReadFailure(`Redis read failed for ${key}; serving the bundled default.`, error);
    return fallback;
  }
  if (raw === null) return fallback;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      `Stored ${key} failed validation; serving the bundled default.\n${z.prettifyError(parsed.error)}`,
    );
    return fallback;
  }
  return parsed.data;
}

/**
 * A cached read that is not a single GET (an index range, an MGET). Tagged with every key it depends on so saving
 * any of them expires it. Errors propagate: callers decide their own fallback.
 */
export function cachedQuery<T>(
  tags: readonly string[],
  keyParts: readonly string[],
  fn: () => Promise<T>,
): Promise<T> {
  if (!isRedisConfigured()) return Promise.reject(new RedisNotConfiguredError());
  return unstable_cache(fn, ['redis-query', ...keyParts], {
    tags: [...tags],
    revalidate: SAFETY_REVALIDATE_SECONDS,
  })();
}

/** Expire the cache for every key an admin save wrote. Call only from route handlers / server actions. */
export function expireKeys(...keys: readonly string[]): void {
  for (const key of keys) revalidateTag(key, { expire: 0 });
}
