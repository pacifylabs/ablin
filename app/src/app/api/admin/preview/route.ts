import { draftMode } from 'next/headers';
import { requireAdmin } from '@/admin/auth/session';
import { json } from '@/admin/http';

/**
 * GET /api/admin/preview?path=/about        → turn on draft mode and open the page with unpublished edits.
 * GET /api/admin/preview?path=/about&exit=1 → turn it off again.
 * Admin-only (middleware and requireAdmin). `path` must be a public site path, so this can't be used as an open
 * redirect or to bounce into the admin.
 */
export async function GET(request: Request): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  const url = new URL(request.url);
  const path = url.searchParams.get('path') ?? '/';
  const safe =
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !/^\/(api|admin)(\/|$)/.test(path) &&
    !path.includes('\\');
  if (!safe) return json({ error: 'bad_path' }, 400);

  const draft = await draftMode();
  if (url.searchParams.has('exit')) draft.disable();
  else draft.enable();
  return new Response(null, { status: 307, headers: { Location: path } });
}
