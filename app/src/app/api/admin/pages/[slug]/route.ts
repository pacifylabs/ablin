import { requireAdmin } from '@/admin/auth/session';
import { handleGetPage, handlePutPage } from '@/admin/handlers/pages-handler';
import { json } from '@/admin/http';

type Params = Promise<{ slug: string }>;

export async function GET(_request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleGetPage((await params).slug);
}

export async function PUT(request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handlePutPage(request, (await params).slug);
}
