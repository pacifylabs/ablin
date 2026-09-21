import { createHash } from 'node:crypto';
import { config } from '@/lib/config';
import { buildContactSchema, MIN_FILL_MS, toFieldErrors } from '@/lib/contact';
import { getContactPage } from '@/lib/content';
import type { RateLimiter } from '@/lib/rate-limit';

export interface ContactDeps {
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

function json(body: unknown, status: number, headers?: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Validates an enquiry, applies spam controls, then hands it to the API that stores it and notifies the firm.
 * It never reports success unless that API accepted the enquiry: a silent failure would lose a lead.
 */
export async function handleContact(request: Request, deps: ContactDeps): Promise<Response> {
  const now = deps.now ?? Date.now;
  const fetchImpl = deps.fetchImpl ?? fetch;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const { enquiryTypes } = await getContactPage();
  const parsed = buildContactSchema(enquiryTypes.map((t) => t.value)).safeParse(payload);

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    // A filled honeypot is a bot: answer as if it worked so it learns nothing, and send nothing on.
    if (fieldErrors.website) return json({ ok: true }, 200);
    return json({ error: 'validation', fieldErrors }, 422);
  }

  const input = parsed.data;
  if (now() - input.startedAt < MIN_FILL_MS) return json({ ok: true }, 200);

  const ip = clientIp(request);
  const ipHash = createHash('sha256').update(ip).digest('hex');
  const retryAfter = deps.limiter.check(ipHash, now());
  if (retryAfter > 0)
    return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });

  if (!config.contactApiUrl) {
    console.error('Contact enquiry not delivered: CONTACT_API_URL is not configured.');
    return json({ error: 'unavailable' }, 503);
  }

  try {
    const upstream = await fetchImpl(config.contactApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.contactApiToken ? { Authorization: `Bearer ${config.contactApiToken}` } : {}),
      },
      body: JSON.stringify({
        fullName: input.fullName,
        email: input.email,
        organisation: input.organisation,
        enquiryType: input.enquiryType,
        message: input.message,
        consent: input.consent,
        sourcePath: '/contact',
        ipHash,
        userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) {
      console.error(`Contact API rejected an enquiry with status ${upstream.status}.`);
      return json({ error: 'upstream' }, 502);
    }
    return json({ ok: true }, 200);
  } catch (error) {
    console.error(
      'Contact API unreachable:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return json({ error: 'upstream' }, 502);
  }
}
