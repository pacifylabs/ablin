import { requireAdmin } from '@/admin/auth/session';
import {
  handleDeleteSubmission,
  handleGetSubmission,
  handlePatchSubmission,
} from '@/admin/handlers/submissions-handler';
import { json } from '@/admin/http';

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleGetSubmission((await params).id);
}

export async function PATCH(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handlePatchSubmission(request, (await params).id);
}

export async function DELETE(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleDeleteSubmission(request, (await params).id);
}
