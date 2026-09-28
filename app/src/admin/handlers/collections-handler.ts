import { z } from 'zod';
import { expireKeys } from '@/cms/cached';
import { deleteMedia, listMedia, mediaSchema, putMedia, readMedia } from '@/cms/collections/media';
import { readFrameworks } from '@/cms/collections/frameworks';
import {
  deleteService,
  listServicesRaw,
  putService,
  readService,
  SERVICE_SLUG,
  serviceSchema,
} from '@/cms/collections/services';
import { putTopics, readTopics, SEED_TOPICS, topicsListSchema } from '@/cms/collections/topics';
import { GLOBALS, GLOBAL_NAMES } from '@/cms/globals';
import { keys } from '@/cms/keys';
import { redis } from '@/cms/redis';
import { listAllArticles, listPages } from '@/cms/store';
import { isSameOrigin, json } from '@/admin/http';

type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response };

async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<Parsed<T>> {
  if (!isSameOrigin(request)) return { ok: false, response: json({ error: 'bad_origin' }, 403) };
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return { ok: false, response: json({ error: 'invalid_json' }, 400) };
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success)
    return {
      ok: false,
      response: json(
        {
          error: 'validation',
          issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
        422,
      ),
    };
  return { ok: true, data: parsed.data };
}

// --- services ---------------------------------------------------------------------------------------------------

export async function handleListServices(): Promise<Response> {
  return json(await listServicesRaw(), 200);
}

export async function handleGetService(slug: string): Promise<Response> {
  const service = await readService(slug);
  return service ? json(service, 200) : json({ error: 'not_found' }, 404);
}

/** Create (POST) — refuses to overwrite an existing slug. */
export async function handleCreateService(request: Request): Promise<Response> {
  const body = await parseBody(request, serviceSchema);
  if (!body.ok) return body.response;
  if (await readService(body.data.slug)) return json({ error: 'slug_taken' }, 409);
  await putService(body.data);
  expireKeys(keys.servicesIndex, keys.service(body.data.slug));
  return json(body.data, 201);
}

/** Update (PUT) — the slug in the URL is authoritative and cannot be changed by the body. */
export async function handlePutService(slug: string, request: Request): Promise<Response> {
  const body = await parseBody(request, serviceSchema);
  if (!body.ok) return body.response;
  if (body.data.slug !== slug) return json({ error: 'slug_mismatch' }, 422);
  if (!(await readService(slug))) return json({ error: 'not_found' }, 404);
  await putService(body.data);
  expireKeys(keys.servicesIndex, keys.service(slug));
  return json(body.data, 200);
}

export async function handleDeleteService(slug: string, request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);
  if (!SERVICE_SLUG.test(slug)) return json({ error: 'not_found' }, 404);
  await deleteService(slug);
  expireKeys(keys.servicesIndex, keys.service(slug));
  return json({ ok: true }, 200);
}

const orderSchema = z.object({ slugs: z.array(z.string().regex(SERVICE_SLUG)).min(1) });

/** Reorder: the given slugs get orders 0..n-1. Unknown slugs are rejected. */
export async function handleReorderServices(request: Request): Promise<Response> {
  const body = await parseBody(request, orderSchema);
  if (!body.ok) return body.response;
  const all = await listServicesRaw();
  const bySlug = new Map(all.map((s) => [s.slug, s]));
  if (body.data.slugs.some((s) => !bySlug.has(s))) return json({ error: 'unknown_slug' }, 422);
  await Promise.all(
    body.data.slugs.map((slug, order) => putService({ ...bySlug.get(slug)!, order })),
  );
  expireKeys(keys.servicesIndex, ...body.data.slugs.map((s) => keys.service(s)));
  return json({ ok: true }, 200);
}

// --- topics -----------------------------------------------------------------------------------------------------

export async function handleGetTopics(): Promise<Response> {
  return json((await readTopics()) ?? SEED_TOPICS, 200);
}

export async function handlePutTopics(request: Request): Promise<Response> {
  const body = await parseBody(request, topicsListSchema);
  if (!body.ok) return body.response;
  await putTopics(body.data);
  expireKeys(keys.topics);
  return json(body.data, 200);
}

// --- media ------------------------------------------------------------------------------------------------------

export async function handleListMedia(): Promise<Response> {
  return json(await listMedia(), 200);
}

const mediaPatchSchema = mediaSchema.pick({ alt: true, credit: true });

export async function handlePatchMedia(id: string, request: Request): Promise<Response> {
  const body = await parseBody(request, mediaPatchSchema);
  if (!body.ok) return body.response;
  const current = await readMedia(id);
  if (!current) return json({ error: 'not_found' }, 404);
  const next = { ...current, ...body.data };
  await putMedia(next);
  expireKeys(keys.media(id));
  return json(next, 200);
}

/** Where a media item is referenced, as human-readable labels. Scans every document that can hold an image. */
export async function findMediaUsage(id: string): Promise<string[]> {
  const needle = `"mediaId":"${id}"`;
  const uses = (label: string, doc: unknown) =>
    JSON.stringify(doc).includes(needle) ? [label] : [];
  const [pages, services, frameworks, articles, globals] = await Promise.all([
    listPages(),
    listServicesRaw(),
    readFrameworks(),
    listAllArticles(),
    Promise.all(GLOBAL_NAMES.map(async (n) => [n, await redis().get(GLOBALS[n].key)] as const)),
  ]);
  return [
    ...pages.flatMap((p) => uses(`page: ${p.slug}`, p)),
    ...services.flatMap((s) => uses(`service: ${s.slug}`, s)),
    ...(frameworks ?? []).flatMap((f) => uses(`framework: ${f.id}`, f)),
    ...articles.flatMap((a) => uses(`article: ${a.slug}`, a)),
    ...globals.flatMap(([n, v]) => uses(`settings: ${n}`, v)),
  ];
}

/** Refuses to delete an image that is still used anywhere, and says where. */
export async function handleDeleteMedia(id: string, request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);
  if (!(await readMedia(id))) return json({ error: 'not_found' }, 404);
  const usage = await findMediaUsage(id);
  if (usage.length > 0) return json({ error: 'in_use', usage }, 409);
  await deleteMedia(id);
  expireKeys(keys.media(id));
  return json({ ok: true }, 200);
}
