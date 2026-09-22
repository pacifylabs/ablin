import type { NextResponse } from 'next/server';
import { SESSION_MAX_AGE_SECONDS } from '@/cms/store';

/**
 * httpOnly, sameSite=lax session cookie. `secure` is forced off outside production so it still works over plain
 * http in local dev (a `secure` cookie is silently dropped by some browsers on non-TLS localhost) — this is the
 * only difference from production, where it is always on.
 */
export const SESSION_COOKIE = 'ablin_admin_session';

const isProd = process.env.NODE_ENV === 'production';

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
