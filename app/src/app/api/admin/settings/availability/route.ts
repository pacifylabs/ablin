import { requireAdmin } from '@/admin/auth/session';
import { handleGetAvailability, handlePutAvailability } from '@/admin/handlers/settings-handler';
import { json } from '@/admin/http';

export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleGetAvailability();
}

export async function PUT(request: Request): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handlePutAvailability(request);
}
