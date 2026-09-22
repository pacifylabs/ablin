/**
 * Fixed-window, in-memory rate limiter. State lives in one server instance, and on Vercel each serverless instance
 * has its own, so this only blunts casual repeat submissions. Before launch, back this interface with a shared store
 * (for example Upstash Redis through the Vercel Marketplace) so limits hold across instances. State is bounded by
 * pruning expired keys.
 */
export interface RateLimiter {
  /** Returns 0 when allowed, otherwise the seconds until the caller may retry. */
  check(key: string, now?: number): number | Promise<number>;
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key, now = Date.now()) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      const entry = hits.get(key);
      if (!entry) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return 0;
      }
      if (entry.count >= limit) return Math.ceil((entry.resetAt - now) / 1000);
      entry.count += 1;
      return 0;
    },
  };
}
