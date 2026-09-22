import { cookies } from 'next/headers';
import { getSession } from '@/cms/store';
import { SESSION_COOKIE } from './cookies';

/**
 * Resolves the current admin session from the request cookie, for use in Route Handlers and admin Server
 * Components. Middleware already redirects unauthenticated page loads to /admin/login (see src/middleware.ts),
 * but every protected API handler re-checks here too — middleware only gates page navigations, not fetch calls,
 * and the two must not be allowed to drift apart (PRD baseline: enforce authZ on every protected path).
 */
export async function currentAdminId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await getSession(token);
  return session?.adminId ?? null;
}

export async function requireAdmin(): Promise<string | null> {
  return currentAdminId();
}
