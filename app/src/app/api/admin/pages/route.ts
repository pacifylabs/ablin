import { requireAdmin } from '@/admin/auth/session';
import { handleListPages } from '@/admin/handlers/pages-handler';
import { json } from '@/admin/http';

export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleListPages();
}
