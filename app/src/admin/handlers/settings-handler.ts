import { getAvailability, setAvailability } from '@/cms/store';
import { availabilitySchema } from '@/cms/schema';
import { isSameOrigin, json } from '@/admin/http';

export async function handleGetAvailability(): Promise<Response> {
  const availability = await getAvailability();
  return json(availability ?? { mode: 'live', message: '', updatedAt: '' }, 200);
}

const putSchema = availabilitySchema.omit({ updatedAt: true });

export async function handlePutAvailability(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = putSchema.safeParse(payload);
  if (!parsed.success)
    return json({ error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors }, 422);

  const value = { ...parsed.data, updatedAt: new Date().toISOString() };
  await setAvailability(value);
  return json(value, 200);
}
