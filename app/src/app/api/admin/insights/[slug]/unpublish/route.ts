import { requireAdmin } from '@/admin/auth/session';
import { handleUnpublishInsight } from '@/admin/handlers/insights-handler';
import { json } from '@/admin/http';

type Params = Promise<{ slug: string }>;

export async function POST(_request: Request, { params }: { params: Params }): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleUnpublishInsight((await params).slug);
}
