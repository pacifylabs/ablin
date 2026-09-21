/**
 * Fixed-window, in-memory rate limiter. It is per server instance, which is enough to blunt abuse of the form
 * until the Redis-backed limiter in the API phase (PRD §13) replaces it. State is bounded by pruning expired keys.
 */
export interface RateLimiter {
  /** Returns 0 when allowed, otherwise the seconds until the caller may retry. */
  check(key: string, now?: number): number;
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
