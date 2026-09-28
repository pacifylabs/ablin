import { requireAdmin } from '@/admin/auth/session';
import { handleDeleteMedia, handlePatchMedia } from '@/admin/handlers/collections-handler';
import { json } from '@/admin/http';

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handlePatchMedia((await params).id, request);
}

export async function DELETE(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleDeleteMedia((await params).id, request);
}
