import { createHash, randomUUID } from 'node:crypto';
import { buildContactSchema, MIN_FILL_MS, toFieldErrors } from '@/lib/contact';
import { deliverContact, type ContactMessage, type DeliveryResult } from '@/lib/contact-delivery';
import { getContactPage } from '@/lib/content';
import type { RateLimiter } from '@/lib/rate-limit';
import { putSubmission } from '@/cms/store';
import type { Submission } from '@/cms/schema';

export interface ContactDeps {
  limiter: RateLimiter;
  /** Swappable in tests; defaults to emailing the enquiry from this Next.js server. */
  deliver?: (message: ContactMessage) => Promise<DeliveryResult>;
  /** Swappable in tests; defaults to writing the enquiry to the admin submissions inbox (Redis). */
  store?: (submission: Submission) => Promise<void>;
  now?: () => number;
  newId?: () => string;
}

function json(body: unknown, status: number, headers?: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Validates an enquiry, applies spam controls, then both records it in the admin submissions inbox and emails
 * it to the firm. It reports success as soon as either side has the enquiry — a visitor is never told their
 * message was lost when it safely reached the inbox but the email happened to fail, or the other way round —
 * and only fails loudly when NEITHER did, since that is the one case where the enquiry really was lost.
 */
export async function handleContact(request: Request, deps: ContactDeps): Promise<Response> {
  const now = deps.now ?? Date.now;
  const newId = deps.newId ?? randomUUID;
  const deliver = deps.deliver ?? ((message: ContactMessage) => deliverContact(message));
  const store = deps.store ?? putSubmission;

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

  const submission: Submission = {
    id: newId(),
    fullName: input.fullName,
    email: input.email,
    organisation: input.organisation,
    enquiryType: input.enquiryType,
    message: input.message,
    consent: input.consent,
    sourcePath: '/contact',
    status: 'unread',
    createdAt: new Date(now()).toISOString(),
  };

  const [deliverResult, storeResult] = await Promise.allSettled([
    deliver({
      fullName: input.fullName,
      email: input.email,
      organisation: input.organisation,
      enquiryLabel,
      message: input.message,
    }),
    store(submission),
  ]);

  const delivered = deliverResult.status === 'fulfilled' && deliverResult.value.ok;
  const stored = storeResult.status === 'fulfilled';
  if (delivered || stored) return json({ ok: true }, 200);

  // Neither side got the enquiry: this is the one case a visitor must be told it did not go through.
  if (storeResult.status === 'rejected')
    console.error('Contact enquiry not stored:', storeResult.reason);
  const reason =
    deliverResult.status === 'fulfilled' && !deliverResult.value.ok
      ? deliverResult.value.reason
      : 'unreachable';
  if (reason === 'not_configured') {
    console.error(
      'Contact enquiry not delivered: RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL must all be set.',
    );
    return json({ error: 'unavailable' }, 503);
  }
  return json({ error: 'upstream' }, 502);
}
