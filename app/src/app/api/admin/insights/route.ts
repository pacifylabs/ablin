import { requireAdmin } from '@/admin/auth/session';
import { handleCreateInsight, handleListInsights } from '@/admin/handlers/insights-handler';
import { json } from '@/admin/http';

export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleListInsights();
}

export async function POST(request: Request): Promise<Response> {
  if (!(await requireAdmin())) return json({ error: 'unauthenticated' }, 401);
  return handleCreateInsight(request);
}
