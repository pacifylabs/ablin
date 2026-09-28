import { requireAdmin } from '@/admin/auth/session';
import { handleCreateService, handleListServices } from '@/admin/handlers/collections-handler';
import { json } from '@/admin/http';

export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleListServices();
}

export async function POST(request: Request): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleCreateService(request);
}
