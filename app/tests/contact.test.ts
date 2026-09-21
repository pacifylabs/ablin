import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from '@/lib/rate-limit';

const NOW = 1_800_000_000_000;

function valid(overrides: Record<string, unknown> = {}) {
  return {
    fullName: 'Amina Yusuf',
    email: 'amina@example.com',
    organisation: 'Example Ltd',
    enquiryType: 'grc',
    message: 'We need help mapping our obligations under UK GDPR.',
    consent: true,
    website: '',
    startedAt: NOW - 20_000,
    ...overrides,
  };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.9', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('contact handler', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function load(env: Record<string, string> = {}) {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
    const mod = await import('@/lib/contact-handler');
    const limiter = (await import('@/lib/rate-limit')).createRateLimiter(3, 60_000);
    return { handle: mod.handleContact, limiter };
  }

  it('rejects malformed JSON', async () => {
    const { handle, limiter } = await load();
    const res = await handle(post('{not json'), { limiter, now: () => NOW });
    expect(res.status).toBe(400);
  });

  it('returns field errors for invalid input', async () => {
    const { handle, limiter } = await load();
    const res = await handle(
      post(valid({ email: 'nope', message: 'short', consent: false, enquiryType: 'x' })),
      {
        limiter,
        now: () => NOW,
      },
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { fieldErrors: Record<string, string> };
    expect(Object.keys(body.fieldErrors).sort()).toEqual([
      'consent',
      'email',
      'enquiryType',
      'message',
    ]);
  });

  it('answers a filled honeypot with success but forwards nothing', async () => {
    const { handle, limiter } = await load({ CONTACT_API_URL: 'http://api.test/contact' });
    const fetchImpl = vi.fn();
    const res = await handle(post(valid({ website: 'http://spam.example' })), {
      limiter,
      fetchImpl,
      now: () => NOW,
    });
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('drops submissions made faster than a person could type', async () => {
    const { handle, limiter } = await load({ CONTACT_API_URL: 'http://api.test/contact' });
    const fetchImpl = vi.fn();
    const res = await handle(post(valid({ startedAt: NOW - 500 })), {
      limiter,
      fetchImpl,
      now: () => NOW,
    });
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('fails loudly, not silently, when no delivery API is configured', async () => {
    const { handle, limiter } = await load({ CONTACT_API_URL: '' });
    const res = await handle(post(valid()), { limiter, now: () => NOW });
    expect(res.status).toBe(503);
  });

  it('forwards a valid enquiry and reports success only when the API accepts it', async () => {
    const { handle, limiter } = await load({
      CONTACT_API_URL: 'http://api.test/contact',
      CONTACT_API_TOKEN: 't0ken',
    });
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const res = await handle(post(valid()), { limiter, fetchImpl, now: () => NOW });
    expect(res.status).toBe(200);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/contact');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer t0ken');
    const sent = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(sent.email).toBe('amina@example.com');
    // The raw address is never forwarded, only its hash.
    expect(JSON.stringify(sent)).not.toContain('203.0.113.9');
    expect(sent.ipHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns 502 when the API rejects or is unreachable', async () => {
    const { handle, limiter } = await load({ CONTACT_API_URL: 'http://api.test/contact' });
    const rejected = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    expect(
      (await handle(post(valid()), { limiter, fetchImpl: rejected, now: () => NOW })).status,
    ).toBe(502);
    const down = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    expect((await handle(post(valid()), { limiter, fetchImpl: down, now: () => NOW })).status).toBe(
      502,
    );
  });

  it('rate limits repeat submissions from one address', async () => {
    const { handle, limiter } = await load({ CONTACT_API_URL: 'http://api.test/contact' });
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      statuses.push((await handle(post(valid()), { limiter, fetchImpl, now: () => NOW })).status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});

describe('rate limiter', () => {
  it('allows again after the window passes', () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check('a', 0)).toBe(0);
    expect(limiter.check('a', 500)).toBeGreaterThan(0);
    expect(limiter.check('a', 1001)).toBe(0);
  });

  it('tracks keys independently', () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.check('a', 0)).toBe(0);
    expect(limiter.check('b', 0)).toBe(0);
  });
});
