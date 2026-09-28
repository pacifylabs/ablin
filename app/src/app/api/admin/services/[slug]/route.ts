import { requireAdmin } from '@/admin/auth/session';
import {
  handleDeleteService,
  handleGetService,
  handlePutService,
} from '@/admin/handlers/collections-handler';
import { json } from '@/admin/http';

type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleGetService((await params).slug);
}

export async function PUT(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handlePutService((await params).slug, request);
}

export async function DELETE(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleDeleteService((await params).slug, request);
}
