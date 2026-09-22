import { requireAdmin } from '@/admin/auth/session';
import { handleUploadImage } from '@/admin/handlers/upload-handler';
import { json, rateLimited } from '@/admin/http';

export async function POST(request: Request): Promise<Response> {
  const adminId = await requireAdmin();
  if (!adminId) return json({ error: 'unauthenticated' }, 401);
  const retryAfter = await rateLimited('upload-image', adminId, 30, 60 * 60);
  if (retryAfter > 0)
    return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfter) });
  return handleUploadImage(request);
}
