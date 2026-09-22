import { z } from 'zod';
import { getSubmission, listSubmissions, setSubmissionStatus } from '@/cms/store';
import { isSameOrigin, json } from '@/admin/http';

/** Not itself one of the brief's listed endpoints — the read-only inbox list is fetched directly in the admin
 *  Server Component from cms/store, so this is only used if something else needs the collection over HTTP. */
export async function handleListSubmissions(): Promise<Response> {
  return json(await listSubmissions(), 200);
}

export async function handleGetSubmission(id: string): Promise<Response> {
  const submission = await getSubmission(id);
  if (!submission) return json({ error: 'not_found' }, 404);
  return json(submission, 200);
}

const patchSchema = z.object({ status: z.enum(['unread', 'read', 'archived']) });

export async function handlePatchSubmission(request: Request, id: string): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = patchSchema.safeParse(payload);
  if (!parsed.success) return json({ error: 'validation' }, 422);

  const updated = await setSubmissionStatus(id, parsed.data.status);
  if (!updated) return json({ error: 'not_found' }, 404);
  return json(updated, 200);
}
