import { requireAdmin } from '@/admin/auth/session';
import { handleChangePassword } from '@/admin/handlers/auth-handler';
import { json } from '@/admin/http';

export async function POST(request: Request): Promise<Response> {
  const adminId = await requireAdmin();
  if (!adminId) return json({ error: 'unauthenticated' }, 401);
  return handleChangePassword(request, adminId);
}
