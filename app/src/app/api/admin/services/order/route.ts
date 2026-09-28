import { requireAdmin } from '@/admin/auth/session';
import { handleReorderServices } from '@/admin/handlers/collections-handler';
import { json } from '@/admin/http';

export async function PUT(request: Request): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleReorderServices(request);
}
