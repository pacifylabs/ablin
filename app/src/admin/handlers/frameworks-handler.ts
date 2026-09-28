import { expireKeys } from '@/cms/cached';
import {
  SEED_FRAMEWORKS,
  frameworksListSchema,
  putFrameworks,
  readFrameworks,
} from '@/cms/collections/frameworks';
import { keys } from '@/cms/keys';
import { isSameOrigin, json } from '@/admin/http';

/** GET/PUT the `frameworks` collection. The whole ordered list is replaced on save. */
export async function handleGetFrameworks(): Promise<Response> {
  return json((await readFrameworks()) ?? SEED_FRAMEWORKS, 200);
}

export async function handlePutFrameworks(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = frameworksListSchema.safeParse(payload);
  if (!parsed.success)
    return json(
      {
        error: 'validation',
        issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
      422,
    );

  await putFrameworks(parsed.data);
  expireKeys(keys.frameworksList);
  return json(parsed.data, 200);
}
