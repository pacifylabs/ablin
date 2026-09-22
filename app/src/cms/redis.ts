import { Redis } from '@upstash/redis';

/**
 * The one Redis client, shared by the Node route handlers, the seed script and the edge middleware. Upstash's
 * REST client works unchanged in both runtimes, which is why it was chosen over a TCP client (ioredis) — the
 * middleware step (availability gate + session check) requires the edge runtime.
 *
 * `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are read directly from `process.env` here, not through
 * `lib/config.ts`: `@upstash/redis` needs them at construction time in the edge bundle, and `lib/config.ts` is not
 * edge-safe (it is written for the Node route handlers). Both are required; a missing one fails loudly rather than
 * silently returning empty content.
 */
function client(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must both be set (see .env.example).',
    );
  }
  return new Redis({ url, token });
}

let cached: Redis | undefined;

/** Lazily constructed so importing this module never throws at build time — only a real request does. */
export function redis(): Redis {
  return (cached ??= client());
}
