import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContactMessage } from '@/lib/contact-delivery';
import { deliverContact } from '@/lib/contact-delivery';
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
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function load(limit = 3) {
    const { handleContact } = await import('@/lib/contact-handler');
    return { handle: handleContact, limiter: createRateLimiter(limit, 60_000) };
  }

  const ok = () =>
    vi.fn<(m: ContactMessage) => Promise<{ ok: true }>>().mockResolvedValue({ ok: true });

  it('rejects malformed JSON', async () => {
    const { handle, limiter } = await load();
    expect((await handle(post('{not json'), { limiter, now: () => NOW })).status).toBe(400);
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

  it('answers a filled honeypot with success but delivers nothing', async () => {
    const { handle, limiter } = await load();
    const deliver = ok();
    const res = await handle(post(valid({ website: 'http://spam.example' })), {
      limiter,
      deliver,
      now: () => NOW,
    });
    expect(res.status).toBe(200);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('drops submissions made faster than a person could type', async () => {
    const { handle, limiter } = await load();
    const deliver = ok();
    const res = await handle(post(valid({ startedAt: NOW - 500 })), {
      limiter,
      deliver,
      now: () => NOW,
    });
    expect(res.status).toBe(200);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('delivers a valid enquiry with the human enquiry label, and reports success', async () => {
    const { handle, limiter } = await load();
    const deliver = ok();
    const res = await handle(post(valid()), { limiter, deliver, now: () => NOW });
    expect(res.status).toBe(200);
    expect(deliver).toHaveBeenCalledOnce();
    const sent = deliver.mock.calls[0]![0];
    expect(sent.enquiryLabel).toBe('Governance, risk and compliance');
    expect(sent.email).toBe('amina@example.com');
    // Nothing about the visitor's network identity is passed to delivery.
    expect(JSON.stringify(sent)).not.toContain('203.0.113.9');
  });

  it('fails loudly, not silently, when email delivery is not configured', async () => {
    const { handle, limiter } = await load();
    const deliver = vi.fn().mockResolvedValue({ ok: false, reason: 'not_configured' });
    expect((await handle(post(valid()), { limiter, deliver, now: () => NOW })).status).toBe(503);
  });

  it('returns 502 when the provider rejects or is unreachable, never success', async () => {
    const { handle, limiter } = await load();
    for (const reason of ['rejected', 'unreachable'] as const) {
      const deliver = vi.fn().mockResolvedValue({ ok: false, reason });
      expect((await handle(post(valid()), { limiter, deliver, now: () => NOW })).status).toBe(502);
    }
  });

  it('rate limits repeat submissions from one address', async () => {
    const { handle, limiter } = await load(3);
    const deliver = ok();
    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      statuses.push((await handle(post(valid()), { limiter, deliver, now: () => NOW })).status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});

describe('email delivery', () => {
  const contact = {
    resendApiKey: 're_test_key',
    toEmail: 'firm@example.com',
    fromEmail: 'Ablin <enquiries@example.com>',
  };
  const message: ContactMessage = {
    fullName: 'Amina Yusuf',
    email: 'amina@example.com',
    organisation: 'Example Ltd',
    enquiryLabel: 'SOC 2',
    message: 'Line one.\nLine two.',
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is not_configured unless key, recipient and sender are all set', async () => {
    const fetchImpl = vi.fn();
    for (const missing of ['resendApiKey', 'toEmail', 'fromEmail'] as const) {
      const result = await deliverContact(message, {
        contact: { ...contact, [missing]: '' },
        fetchImpl,
      });
      expect(result, missing).toEqual({ ok: false, reason: 'not_configured' });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('posts one email to Resend with reply-to set to the enquirer', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    expect(await deliverContact(message, { contact, fetchImpl })).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body).toMatchObject({
      from: contact.fromEmail,
      to: [contact.toEmail],
      reply_to: 'amina@example.com',
      subject: 'Website enquiry: SOC 2',
    });
    expect(body.text).toContain('Name: Amina Yusuf');
    expect(body.text).toContain('Line one.\nLine two.');
  });

  it('cannot be used to inject headers or extra subject lines through visitor-typed fields', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await deliverContact(
      { ...message, fullName: 'Eve\r\nBcc: victim@example.com', organisation: 'X\nSubject: spoof' },
      { contact, fetchImpl },
    );
    const body = JSON.parse(
      (fetchImpl.mock.calls[0] as [string, RequestInit])[1].body as string,
    ) as Record<string, string>;
    expect(body.subject).toBe('Website enquiry: SOC 2');
    expect(body.text).toContain('Name: Eve Bcc: victim@example.com');
    expect(body.text).toContain('Organisation: X Subject: spoof');
    expect(Object.keys(body).sort()).toEqual(['from', 'reply_to', 'subject', 'text', 'to']);
  });

  it('reports rejection and unreachable providers as failures', async () => {
    const rejected = vi.fn().mockResolvedValue(new Response('{}', { status: 403 }));
    expect(await deliverContact(message, { contact, fetchImpl: rejected })).toEqual({
      ok: false,
      reason: 'rejected',
    });
    const down = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    expect(await deliverContact(message, { contact, fetchImpl: down })).toEqual({
      ok: false,
      reason: 'unreachable',
    });
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
