import { createHash } from 'node:crypto';
import { buildContactSchema, MIN_FILL_MS, toFieldErrors } from '@/lib/contact';
import { deliverContact, type ContactMessage, type DeliveryResult } from '@/lib/contact-delivery';
import { getContactPage } from '@/lib/content';
import type { RateLimiter } from '@/lib/rate-limit';

export interface ContactDeps {
  limiter: RateLimiter;
  /** Swappable in tests; defaults to emailing the enquiry from this Next.js server. */
  deliver?: (message: ContactMessage) => Promise<DeliveryResult>;
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
 * Validates an enquiry, applies spam controls, then emails it to the firm from this server.
 * It never reports success unless delivery succeeded: a silent failure would lose a lead.
 */
export async function handleContact(request: Request, deps: ContactDeps): Promise<Response> {
  const now = deps.now ?? Date.now;
  const deliver = deps.deliver ?? ((message: ContactMessage) => deliverContact(message));

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

  const ipHash = createHash('sha256').update(clientIp(request)).digest('hex');
  const retryAfter = await deps.limiter.check(ipHash, now());
  if (retryAfter > 0)
    return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });

  const enquiryLabel =
    enquiryTypes.find((t) => t.value === input.enquiryType)?.label ?? input.enquiryType;
  const result = await deliver({
    fullName: input.fullName,
    email: input.email,
    organisation: input.organisation,
    enquiryLabel,
    message: input.message,
  });

  if (result.ok) return json({ ok: true }, 200);
  if (result.reason === 'not_configured') {
    console.error(
      'Contact enquiry not delivered: RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL must all be set.',
    );
    return json({ error: 'unavailable' }, 503);
  }
  return json({ error: 'upstream' }, 502);
}
