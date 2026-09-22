import { createHash } from 'node:crypto';
import { incrementRateLimit } from '@/cms/store';

/** Matches the shape used by lib/contact-handler.ts, so admin handlers read the same as the rest of the project. */
export function json(body: unknown, status: number, headers?: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

export function hashIp(request: Request): string {
  return createHash('sha256').update(clientIp(request)).digest('hex');
}

/** Returns 0 when the call is allowed, otherwise the seconds until it may be retried. */
export async function rateLimited(
  scope: string,
  identity: string,
  limit: number,
  windowSeconds: number,
): Promise<number> {
  const count = await incrementRateLimit(scope, identity, windowSeconds);
  return count > limit ? windowSeconds : 0;
}

/**
 * A same-origin check for state-changing admin requests. The session cookie is SameSite=Lax, which already blocks
 * cross-site POST/PUT/DELETE from sending it, but this is a second, explicit layer specifically called out for
 * anything touching auth. A missing Origin header (some non-browser clients) is allowed through — the cookie
 * check upstream is what actually gates access.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
