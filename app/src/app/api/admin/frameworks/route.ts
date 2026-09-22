import { requireAdmin } from '@/admin/auth/session';
import { handleGetFrameworks, handlePutFrameworks } from '@/admin/handlers/frameworks-handler';
import { json } from '@/admin/http';

export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleGetFrameworks();
}

export async function PUT(request: Request): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handlePutFrameworks(request);
}
