import { Redis } from '@upstash/redis';

/**
 * The one Redis client, shared by the Node route handlers, the seed script and the edge middleware. Upstash's
 * REST client works unchanged in both runtimes, which is why it was chosen over a TCP client (ioredis) — the
 * middleware step (availability gate + session check) requires the edge runtime.
 *
 * Credentials are read directly from `process.env` here, not through `lib/config.ts`: `@upstash/redis` needs them at
 * construction time in the edge bundle, and `lib/config.ts` is not edge-safe. Accepted names, first match wins:
 *   1. UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (set by hand)
 *   2. ablin_upstash_KV_REST_API_URL / ablin_upstash_KV_REST_API_TOKEN (the Vercel Upstash integration's names for
 *      this project, which Vercel also sets for Preview deployments)
 *   3. KV_REST_API_URL / KV_REST_API_TOKEN (the integration's default, unprefixed names)
 * Literal property access, not a computed lookup, so Next inlines them into the edge bundle.
 */
function credentials(): { url: string; token: string } | null {
  const pairs: [string | undefined, string | undefined][] = [
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env.ablin_upstash_KV_REST_API_URL, process.env.ablin_upstash_KV_REST_API_TOKEN],
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
  ];
  for (const [url, token] of pairs) {
    if (url?.trim() && token?.trim()) return { url: url.trim(), token: token.trim() };
  }
  return null;
}

/** False when no Redis credentials are set at all (e.g. a build without env vars), as opposed to Redis being down. */
export function isRedisConfigured(): boolean {
  return credentials() !== null;
}

export class RedisNotConfiguredError extends Error {
  constructor() {
    super(
      'Redis is not configured: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (see .env.example).',
    );
    this.name = 'RedisNotConfiguredError';
  }
}

let cached: Redis | undefined;

/** Lazily constructed so importing this module never throws at build time — only a real request does. */
export function redis(): Redis {
  if (cached) return cached;
  const creds = credentials();
  if (!creds) throw new RedisNotConfiguredError();
  return (cached = new Redis(creds));
}

let warnedNotConfigured = false;

/**
 * Logs a failed public read. A missing configuration is reported once per process (a build without env vars would
 * otherwise print one stack trace per page); a real Redis error is logged every time, with its stack.
 */
export function reportReadFailure(context: string, error: unknown): void {
  if (error instanceof RedisNotConfiguredError) {
    if (!warnedNotConfigured) {
      warnedNotConfigured = true;
      console.warn(`${error.message} Serving bundled content until it is.`);
    }
    return;
  }
  console.error(context, error);
}
