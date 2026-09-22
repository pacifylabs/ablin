import { handleResetConfirm } from '@/admin/handlers/auth-handler';

export async function POST(request: Request): Promise<Response> {
  return handleResetConfirm(request);
}
