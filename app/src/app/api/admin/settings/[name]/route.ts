import { requireAdmin } from '@/admin/auth/session';
import { handleGetGlobal, handlePutGlobal } from '@/admin/handlers/globals-handler';
import { json } from '@/admin/http';

type Params = Promise<{ name: string }>;

export async function GET(_request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleGetGlobal((await params).name);
}

export async function PUT(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handlePutGlobal((await params).name, request);
}
