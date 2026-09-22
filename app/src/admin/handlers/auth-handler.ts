import { z } from 'zod';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  deleteAllSessions,
  deleteSession,
  createSession,
  createResetToken,
  consumeResetToken,
  getAdminUser,
  putAdminUser,
} from '@/cms/store';
import { config } from '@/lib/config';
import { clearSessionCookie, SESSION_COOKIE, setSessionCookie } from '@/admin/auth/cookies';
import { hashIp, isSameOrigin, json, rateLimited } from '@/admin/http';
import {
  hashPassword,
  isPasswordStrongEnough,
  MIN_PASSWORD_LENGTH,
  verifyPassword,
} from '@/admin/auth/password';
import { sendResetEmail } from '@/admin/auth/reset-email';
import { randomToken } from '@/admin/auth/tokens';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

/**
 * Single admin user, so "login" means: does this email match the one admin, and does the password verify. A
 * wrong email and a wrong password get the identical response and timing-insensitive-enough error, so a caller
 * cannot use this endpoint to discover whether an email is the admin's.
 */
export async function handleLogin(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return json({ error: 'validation' }, 422);

  const retryAfter = await rateLimited('login', hashIp(request), 10, 10 * 60);
  if (retryAfter > 0)
    return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });

  const user = await getAdminUser();
  const ok =
    user && user.email.toLowerCase() === parsed.data.email.toLowerCase()
      ? await verifyPassword(user.passwordHash, parsed.data.password)
      : false;
  if (!user || !ok) return json({ error: 'invalid_credentials' }, 401);

  const token = randomToken();
  await createSession(token, { adminId: user.id, createdAt: new Date().toISOString() });

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, token);
  return response;
}

export async function handleLogout(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}

const resetRequestSchema = z.object({ email: z.string().email() });

/**
 * Always answers 200 whether or not the email matches the admin account — the response cannot be used to test
 * which address the admin uses. The email is only actually sent when it does match.
 */
export async function handleResetRequest(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = resetRequestSchema.safeParse(payload);
  if (!parsed.success) return json({ error: 'validation' }, 422);

  const retryAfter = await rateLimited('reset-request', hashIp(request), 5, 60 * 60);
  if (retryAfter > 0)
    return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });

  const user = await getAdminUser();
  if (user && user.email.toLowerCase() === parsed.data.email.toLowerCase()) {
    const token = randomToken();
    await createResetToken(token, { adminId: user.id });
    const resetUrl = `${config.siteUrl}/admin/reset?token=${token}`;
    const result = await sendResetEmail(user.email, resetUrl);
    if (!result.ok) {
      // Delivery failed: log for the operator, but still answer 200 so nothing about account existence leaks.
      console.error(`Admin password reset email not delivered: ${result.reason}`);
    }
  }
  return json({ ok: true }, 200);
}

const resetConfirmSchema = z
  .object({ token: z.string().min(1), newPassword: z.string(), confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function handleResetConfirm(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = resetConfirmSchema.safeParse(payload);
  if (!parsed.success)
    return json({ error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors }, 422);
  if (!isPasswordStrongEnough(parsed.data.newPassword)) {
    return json({ error: 'weak_password', minLength: MIN_PASSWORD_LENGTH }, 422);
  }

  const retryAfter = await rateLimited('reset-confirm', hashIp(request), 10, 10 * 60);
  if (retryAfter > 0)
    return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });

  // Consuming (get-then-delete) makes the token single-use even if this handler is called twice concurrently.
  const claim = await consumeResetToken(parsed.data.token);
  if (!claim) return json({ error: 'invalid_or_expired_token' }, 400);

  const user = await getAdminUser();
  if (!user || user.id !== claim.adminId) return json({ error: 'invalid_or_expired_token' }, 400);

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await putAdminUser({ ...user, passwordHash, updatedAt: new Date().toISOString() });
  // A reset means the previous password (and anyone holding a session from it) is no longer trusted.
  await deleteAllSessions();

  return json({ ok: true }, 200);
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/** Authenticated change. Invalidates every other session and re-issues one for the browser making the request. */
export async function handleChangePassword(request: Request, adminId: string): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = changePasswordSchema.safeParse(payload);
  if (!parsed.success)
    return json({ error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors }, 422);
  if (!isPasswordStrongEnough(parsed.data.newPassword)) {
    return json({ error: 'weak_password', minLength: MIN_PASSWORD_LENGTH }, 422);
  }

  const retryAfter = await rateLimited('change-password', adminId, 10, 60 * 60);
  if (retryAfter > 0)
    return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });

  const user = await getAdminUser();
  if (!user || user.id !== adminId) return json({ error: 'not_found' }, 404);

  const ok = await verifyPassword(user.passwordHash, parsed.data.currentPassword);
  if (!ok) return json({ error: 'invalid_credentials' }, 401);

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await putAdminUser({ ...user, passwordHash, updatedAt: new Date().toISOString() });
  await deleteAllSessions();

  const token = randomToken();
  await createSession(token, { adminId: user.id, createdAt: new Date().toISOString() });

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, token);
  return response;
}
