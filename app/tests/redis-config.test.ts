import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const NAMES = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'ablin_upstash_KV_REST_API_URL',
  'ablin_upstash_KV_REST_API_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const n of NAMES) {
    saved[n] = process.env[n];
    delete process.env[n];
  }
  vi.resetModules();
});
afterEach(() => {
  for (const n of NAMES) {
    if (saved[n] === undefined) delete process.env[n];
    else process.env[n] = saved[n];
  }
  vi.restoreAllMocks();
});

describe('redis credentials', () => {
  it('uses the Vercel Upstash integration names when the manual ones are absent (Preview deployments)', async () => {
    process.env.ablin_upstash_KV_REST_API_URL = 'https://example.upstash.io';
    process.env.ablin_upstash_KV_REST_API_TOKEN = 'token';
    const { isRedisConfigured } = await import('@/cms/redis');
    expect(isRedisConfigured()).toBe(true);
  });

  it('treats blank values as missing and throws a typed error', async () => {
    process.env.UPSTASH_REDIS_REST_URL = ' ';
    process.env.UPSTASH_REDIS_REST_TOKEN = '';
    const { isRedisConfigured, redis, RedisNotConfiguredError } = await import('@/cms/redis');
    expect(isRedisConfigured()).toBe(false);
    expect(() => redis()).toThrow(RedisNotConfiguredError);
  });
});

describe('public page reads without Redis', () => {
  it('serve the bundled legal page instead of failing the build, and warn only once', async () => {
    vi.doMock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }));
    vi.doMock('next/headers', () => ({ draftMode: async () => ({ isEnabled: false }) }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { getPublicPage } = await import('@/cms/public-reads');
    const page = await getPublicPage('privacy-policy');
    expect(page.noindex).toBe(true);
    await getPublicPage('cookie-policy');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
