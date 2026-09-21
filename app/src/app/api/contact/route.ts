import { handleContact } from '@/lib/contact-handler';
import { createRateLimiter } from '@/lib/rate-limit';

// Five enquiries per address every ten minutes is well beyond any genuine use.
const limiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: Request): Promise<Response> {
  return handleContact(request, { limiter });
}
