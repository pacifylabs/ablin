import { handleLogout } from '@/admin/handlers/auth-handler';

export async function POST(): Promise<Response> {
  return handleLogout();
}
