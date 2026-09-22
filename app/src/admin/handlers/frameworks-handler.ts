import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { frameworkSchema } from '@/content/schema';
import { getFrameworksWithFallback, putFrameworks } from '@/cms/store';
import { FOOTER_FRAMEWORKS_TAG } from '@/cms/frameworks-cache';
import { isSameOrigin, json } from '@/admin/http';

export async function handleGetFrameworks(): Promise<Response> {
  return json(await getFrameworksWithFallback(), 200);
}

/**
 * The list shown by the footer slider and offered by the frameworkIndex block's picker. `id` stays the fixed
 * five-value enum from content/schema.ts — each has its own hand-drawn glyph in ui/FrameworkBadge.tsx with no
 * generic fallback, so this can reorder, edit or hide the five frameworks, but not invent a new one.
 */
const putSchema = z.array(frameworkSchema).min(1);

export async function handlePutFrameworks(request: Request): Promise<Response> {
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

  const ids = parsed.data.map((f) => f.id);
  if (new Set(ids).size !== ids.length) return json({ error: 'duplicate_id' }, 422);

  await putFrameworks(parsed.data);
  revalidateTag(FOOTER_FRAMEWORKS_TAG, 'default');
  return json(parsed.data, 200);
}
