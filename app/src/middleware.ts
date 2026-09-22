import { NextResponse, type NextRequest } from 'next/server';
import { getAvailability, getSession } from '@/cms/store';
import type { Availability } from '@/cms/schema';
import { SESSION_COOKIE } from '@/admin/auth/cookies';

/**
 * The single edge gate for the whole site (build brief: "Middleware behaviour", exact order below). Runs on
 * every request except the static-asset paths excluded by `config.matcher` and the extra prefixes skipped below.
 *
 * Still named middleware.ts, not proxy.ts: Next 16 deprecated the filename but middleware.ts keeps working
 * (a build-time warning only), and the brief names this file explicitly.
 */

const STATIC_PREFIXES = [
  '/image/',
  '/favicon.ico',
  '/icon.png',
  '/opengraph-image.png',
  '/robots.txt',
  '/sitemap.xml',
];

function isStaticAsset(pathname: string): boolean {
  return STATIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

// 1. Availability, cached for 5s per edge isolate so a gate check never adds a Redis round trip to every request.
// Fail OPEN here (an unreachable Redis must not take the public site down) but fail CLOSED in the admin check
// below (an unreachable Redis must not let a stranger into /admin).
let availabilityCache: { value: Availability | null; expiresAt: number } | null = null;

async function readAvailability(): Promise<Availability | null> {
  const now = Date.now();
  if (availabilityCache && availabilityCache.expiresAt > now) return availabilityCache.value;
  try {
    const value = await getAvailability();
    availabilityCache = { value, expiresAt: now + 5000 };
    return value;
  } catch {
    return availabilityCache?.value ?? null; // fail open: treat as unknown, which is handled as "live" below
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (isStaticAsset(pathname)) return NextResponse.next();

  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/');

  // --- 1 & 2: availability gate --------------------------------------------------------------------------------
  if (!isAdminArea && !isAdminApi) {
    const availability = await readAvailability();
    // No settings doc yet (fresh, unseeded Redis) defaults to live, so the public site is never stuck gated.
    const mode = availability?.mode ?? 'live';
    if (mode !== 'live') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'unavailable', mode },
          { status: 503, headers: { 'Retry-After': '120' } },
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = '/status';
      const response = NextResponse.rewrite(url, { status: 503 });
      response.headers.set('Retry-After', '120');
      return response;
    }
  }

  // --- 3: admin auth check ---------------------------------------------------------------------------------
  if (isAdminArea && pathname !== '/admin/login' && pathname !== '/admin/reset') {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    // Fail CLOSED: any error here must deny access, never grant it.
    let session = null;
    if (token) {
      try {
        session = await getSession(token);
      } catch {
        session = null;
      }
    }
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // --- 4: continue -------------------------------------------------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
