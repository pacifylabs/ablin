import { handleContact } from '@/lib/contact-handler';

export async function POST(request: Request): Promise<Response> {
  return handleContact(request, {});
}
