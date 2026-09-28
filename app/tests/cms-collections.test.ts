import type { Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { startFakeUpstash } from './helpers/fake-upstash';

// Next's data cache needs a request context; here it is a pass-through and tag expiry is recorded.
const expired: string[] = [];
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: (tag: string) => expired.push(tag),
}));

let server: Server;
let store: { values: Map<string, unknown> };

beforeAll(async () => {
  const fake = await startFakeUpstash();
  server = fake.server;
  store = fake.store as unknown as { values: Map<string, unknown> };
  process.env.UPSTASH_REDIS_REST_URL = fake.url;
  process.env.UPSTASH_REDIS_REST_TOKEN = fake.token;
});
afterAll(() => server.close());
beforeEach(() => {
  store.values.clear();
  expired.length = 0;
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

function req(method: string, body?: unknown): Request {
  return new Request('http://localhost/api/admin/x', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('services collection', () => {
  it('seed data is valid, ordered and never uses the reserved slug', async () => {
    const { SEED_SERVICES, serviceSchema } = await import('@/cms/collections/services');
    expect(SEED_SERVICES.map((s) => s.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    for (const s of SEED_SERVICES) expect(serviceSchema.safeParse(s).success).toBe(true);
    expect(serviceSchema.safeParse({ ...SEED_SERVICES[0], slug: 'index' }).success).toBe(false);
  });

  it('lists the seed while the collection is empty, then Redis once seeded', async () => {
    const { listServices, putService, SEED_SERVICES } = await import('@/cms/collections/services');
    expect((await listServices()).length).toBe(8);
    await putService({ ...SEED_SERVICES[0]!, title: 'Only one' });
    const listed = await listServices();
    expect(listed.map((s) => s.title)).toEqual(['Only one']);
  });

  it('a deleted service is gone, not resurrected from the seed', async () => {
    const { getService, putService, SEED_SERVICES } = await import('@/cms/collections/services');
    const { handleDeleteService } = await import('@/admin/handlers/collections-handler');
    await putService(SEED_SERVICES[0]!);
    await putService(SEED_SERVICES[1]!);
    await handleDeleteService(SEED_SERVICES[1]!.slug, req('DELETE'));
    expect(await getService(SEED_SERVICES[1]!.slug)).toBeNull();
    expect(expired).toContain('services:index');
  });

  it('create refuses a taken slug; update refuses a slug change', async () => {
    const { SEED_SERVICES } = await import('@/cms/collections/services');
    const { handleCreateService, handlePutService } =
      await import('@/admin/handlers/collections-handler');
    const s = SEED_SERVICES[0]!;
    expect((await handleCreateService(req('POST', s))).status).toBe(201);
    expect((await handleCreateService(req('POST', s))).status).toBe(409);
    expect((await handlePutService(s.slug, req('PUT', { ...s, slug: 'other' }))).status).toBe(422);
    const ok = await handlePutService(s.slug, req('PUT', { ...s, code: 'NEW' }));
    expect(ok.status).toBe(200);
    expect(expired).toEqual(expect.arrayContaining(['services:index', `services:${s.slug}`]));
  });

  it('reorders by slug list and rejects unknown slugs', async () => {
    const { SEED_SERVICES, putService, listServicesRaw } =
      await import('@/cms/collections/services');
    const { handleReorderServices } = await import('@/admin/handlers/collections-handler');
    for (const s of SEED_SERVICES.slice(0, 3)) await putService(s);
    const [a, b, c] = SEED_SERVICES.map((s) => s.slug);
    expect((await handleReorderServices(req('PUT', { slugs: [c, a, b] }))).status).toBe(200);
    expect((await listServicesRaw()).map((s) => s.slug)).toEqual([c, a, b]);
    expect((await handleReorderServices(req('PUT', { slugs: ['nope'] }))).status).toBe(422);
  });
});

describe('frameworks and topics', () => {
  it('rejects duplicate framework ids', async () => {
    const { SEED_FRAMEWORKS } = await import('@/cms/collections/frameworks');
    const { handlePutFrameworks } = await import('@/admin/handlers/frameworks-handler');
    const dup = [SEED_FRAMEWORKS[0], SEED_FRAMEWORKS[0]];
    expect((await handlePutFrameworks(req('PUT', dup))).status).toBe(422);
    expect((await handlePutFrameworks(req('PUT', SEED_FRAMEWORKS))).status).toBe(200);
    expect(expired).toEqual(['frameworks']);
  });

  it('ensureTopics adds only new names and reports whether it changed anything', async () => {
    const { ensureTopics, readTopics, SEED_TOPICS } = await import('@/cms/collections/topics');
    expect(await ensureTopics([SEED_TOPICS[0]!.name])).toBe(false);
    expect(await ensureTopics(['Supplier risk'])).toBe(true);
    const topics = await readTopics();
    expect(topics?.at(-1)).toEqual({ name: 'Supplier risk', slug: 'supplier-risk' });
  });
});

describe('media library', () => {
  const media = {
    id: 'facade-1',
    url: 'https://res.cloudinary.com/demo/image/upload/v1/ablin/facade.jpg',
    publicId: 'ablin/facade',
    alt: 'A facade',
    credit: '',
    width: 1200,
    height: 800,
    blur: '',
    createdAt: '2026-09-01T00:00:00.000Z',
  };

  it('edits alt and credit in one place', async () => {
    const { putMedia, resolveImage } = await import('@/cms/collections/media');
    const { handlePatchMedia } = await import('@/admin/handlers/collections-handler');
    await putMedia(media);
    const res = await handlePatchMedia(
      'facade-1',
      req('PATCH', { alt: 'Glass facade', credit: 'x' }),
    );
    expect(res.status).toBe(200);
    expect(expired).toEqual(['media:facade-1']);
    const resolved = await resolveImage({ mediaId: 'facade-1', decorative: false });
    expect(resolved?.alt).toBe('Glass facade');
    expect((await resolveImage({ mediaId: 'facade-1', decorative: true }))?.alt).toBe('');
  });

  it('refuses to delete an image that is still used, and says where', async () => {
    const { putMedia, readMedia } = await import('@/cms/collections/media');
    const { putService, SEED_SERVICES } = await import('@/cms/collections/services');
    const { handleDeleteMedia } = await import('@/admin/handlers/collections-handler');
    await putMedia(media);
    await putService({
      ...SEED_SERVICES[0]!,
      cardImage: { mediaId: 'facade-1', decorative: true },
    });
    const res = await handleDeleteMedia('facade-1', req('DELETE'));
    expect(res.status).toBe(409);
    expect(((await res.json()) as { usage: string[] }).usage).toEqual([
      `service: ${SEED_SERVICES[0]!.slug}`,
    ]);
    await putService({ ...SEED_SERVICES[0]!, cardImage: null });
    expect((await handleDeleteMedia('facade-1', req('DELETE'))).status).toBe(200);
    expect(await readMedia('facade-1')).toBeNull();
  });
});

describe('Cloudinary loader', () => {
  it('inserts auto format/quality and the requested width for Cloudinary URLs only', async () => {
    const { cloudinaryLoader } = await import('@/cms/cloudinary-loader');
    expect(
      cloudinaryLoader({
        src: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg',
        width: 640,
      }),
    ).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640,c_limit/v1/a.jpg');
    expect(cloudinaryLoader({ src: '/image/photo/a.jpg', width: 640 })).toBe(
      '/_next/image?url=%2Fimage%2Fphoto%2Fa.jpg&w=640&q=75',
    );
  });
});
