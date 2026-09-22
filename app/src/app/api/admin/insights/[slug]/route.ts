import { requireAdmin } from '@/admin/auth/session';
import {
  handleDeleteInsight,
  handleGetInsight,
  handleUpdateInsight,
} from '@/admin/handlers/insights-handler';
import { json } from '@/admin/http';

type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleGetInsight((await params).slug);
}

export async function PUT(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleUpdateInsight(request, (await params).slug);
}

export async function DELETE(_request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleDeleteInsight((await params).slug);
}
