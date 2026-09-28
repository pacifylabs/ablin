import { z } from 'zod';
import { expireKeys } from '@/cms/cached';
import { GLOBALS, isGlobalName, type GlobalName } from '@/cms/globals';
import { redis } from '@/cms/redis';
import { isSameOrigin, json } from '@/admin/http';

/**
 * GET/PUT for the seven `settings:*` singletons. Reads bypass the public cache so the editor always shows what is
 * stored; a value that no longer validates is reported with the seed default alongside, never silently replaced.
 */
export async function handleGetGlobal(name: string): Promise<Response> {
  if (!isGlobalName(name)) return json({ error: 'not_found' }, 404);
  const { key, schema, seed } = GLOBALS[name];
  const raw = await redis().get(key);
  if (raw === null) return json({ value: seed, stored: false }, 200);
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    return json({ value: seed, stored: true, invalid: z.prettifyError(parsed.error) }, 200);
  return json({ value: parsed.data, stored: true }, 200);
}

export async function handlePutGlobal(name: string, request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);
  if (!isGlobalName(name)) return json({ error: 'not_found' }, 404);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const { key, schema } = GLOBALS[name as GlobalName];
  const parsed = schema.safeParse(payload);
  if (!parsed.success)
    return json(
      {
        error: 'validation',
        issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
      422,
    );

  await redis().set(key, parsed.data);
  expireKeys(key);
  return json({ value: parsed.data }, 200);
}
