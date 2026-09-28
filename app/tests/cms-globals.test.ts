import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Next's data cache needs a request context; in unit tests it is a pass-through, and tag expiry is observed.
const expired: string[] = [];
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: (tag: string) => expired.push(tag),
}));

const store = new Map<string, unknown>();
let redisDown = false;
vi.mock('@/cms/redis', () => ({
  redis: () => ({
    get: async (key: string) => {
      if (redisDown) throw new Error('unreachable');
      return store.get(key) ?? null;
    },
    set: async (key: string, value: unknown) => {
      store.set(key, value);
      return 'OK';
    },
  }),
}));

vi.mock('@/admin/http', async (orig) => ({
  ...(await orig<typeof import('@/admin/http')>()),
  isSameOrigin: () => true,
}));

const { GLOBALS, GLOBAL_NAMES, getNavigation, getSiteSettings } = await import('@/cms/globals');
const { siteSettingsSchema } = await import('@/cms/globals/schemas');
const { handleGetGlobal, handlePutGlobal } = await import('@/admin/handlers/globals-handler');
const { getSiteUrl } = await import('@/cms/site-meta');

function put(name: string, body: unknown) {
  return handlePutGlobal(
    name,
    new Request(`http://localhost/api/admin/settings/${name}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  store.clear();
  expired.length = 0;
  redisDown = false;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

describe('globals', () => {
  it.each(GLOBAL_NAMES)('the %s seed default is valid against its own schema', (name) => {
    const { schema, seed } = GLOBALS[name];
    expect(schema.safeParse(seed).success).toBe(true);
  });

  it('every key is a settings:* key', () => {
    for (const name of GLOBAL_NAMES) expect(GLOBALS[name].key).toBe(`settings:${name}`);
  });

  it('serves the seed default when the key is missing, invalid, or Redis is down', async () => {
    expect((await getSiteSettings()).siteName).toBe(GLOBALS.site.seed.siteName);
    store.set('settings:navigation', { items: 'nope' });
    expect((await getNavigation()).items).toEqual(GLOBALS.navigation.seed.items);
    redisDown = true;
    expect((await getNavigation()).cta).toEqual(GLOBALS.navigation.seed.cta);
  });
});

describe('admin settings API', () => {
  it('404s an unknown global', async () => {
    expect((await handleGetGlobal('nope')).status).toBe(404);
    expect((await put('nope', {})).status).toBe(404);
  });

  it('rejects an unsafe link with 422 and stores nothing', async () => {
    const bad = {
      ...GLOBALS.navigation.seed,
      cta: { label: 'x', href: 'javascript:alert(1)' },
    };
    const res = await put('navigation', bad);
    expect(res.status).toBe(422);
    expect(store.has('settings:navigation')).toBe(false);
    expect(expired).toEqual([]);
  });

  it('saves a valid value and expires exactly that key', async () => {
    const value = { ...GLOBALS.footer.seed, region: 'England' };
    const res = await put('footer', value);
    expect(res.status).toBe(200);
    expect((store.get('settings:footer') as { region: string }).region).toBe('England');
    expect(expired).toEqual(['settings:footer']);
  });

  it('GET reports an invalid stored value instead of hiding it', async () => {
    store.set('settings:seo', { titleTemplate: 'no placeholder' });
    const body = (await (await handleGetGlobal('seo')).json()) as { invalid?: string };
    expect(body.invalid).toBeTruthy();
  });
});

describe('site URL', () => {
  it('rejects localhost and plain http as the public origin', () => {
    const base = GLOBALS.site.seed;
    expect(
      siteSettingsSchema.safeParse({ ...base, siteUrl: 'http://localhost:3000' }).success,
    ).toBe(false);
    expect(siteSettingsSchema.safeParse({ ...base, siteUrl: 'http://example.com' }).success).toBe(
      false,
    );
    expect(siteSettingsSchema.parse({ ...base, siteUrl: 'https://example.com/' }).siteUrl).toBe(
      'https://example.com',
    );
  });

  it('prefers the admin setting over the environment', async () => {
    store.set('settings:site', { ...GLOBALS.site.seed, siteUrl: 'https://ablin.example' });
    expect(await getSiteUrl()).toBe('https://ablin.example');
  });
});
