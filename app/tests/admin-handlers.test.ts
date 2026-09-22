import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { startFakeUpstash } from './helpers/fake-upstash';

/**
 * Integration tests for the admin API handlers, run against tests/helpers/fake-upstash.ts (a real HTTP server
 * speaking the Upstash wire protocol) rather than mocks — so these exercise the actual cms/store.ts Redis calls,
 * not a stand-in for them. UPSTASH_REDIS_REST_URL/TOKEN are set before any module that constructs the Redis
 * client is imported, since src/cms/redis.ts reads them once and caches the client.
 */

let server: Server;

beforeAll(async () => {
  const fake = await startFakeUpstash();
  server = fake.server;
  process.env.UPSTASH_REDIS_REST_URL = fake.url;
  process.env.UPSTASH_REDIS_REST_TOKEN = fake.token;
});

afterAll(() => {
  server.close();
});

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/admin/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', ...headers },
    body: JSON.stringify(body),
  });
}

describe('auth handlers', () => {
  beforeEach(async () => {
    const { putAdminUser } = await import('@/cms/store');
    const { hashPassword } = await import('@/admin/auth/password');
    await putAdminUser({
      id: 'admin-1',
      email: 'owner@example.com',
      passwordHash: await hashPassword('Correct-Horse-Battery-Staple'),
      updatedAt: new Date().toISOString(),
    });
  });

  it('logs in with the right credentials and sets a session cookie', async () => {
    const { handleLogin } = await import('@/admin/handlers/auth-handler');
    const res = await handleLogin(
      post({ email: 'owner@example.com', password: 'Correct-Horse-Battery-Staple' }),
    );
    expect(res.status).toBe(200);
    const cookie = res.headers.get('set-cookie');
    expect(cookie).toContain('ablin_admin_session=');
    expect(cookie).toContain('HttpOnly');
  });

  it('rejects the wrong password without revealing which part was wrong', async () => {
    const { handleLogin } = await import('@/admin/handlers/auth-handler');
    const res = await handleLogin(
      post({ email: 'owner@example.com', password: 'nope-nope-nope-nope' }),
    );
    expect(res.status).toBe(401);
    expect((await res.json()) as { error: string }).toEqual({ error: 'invalid_credentials' });
  });

  it('rejects an email that does not match the single admin account', async () => {
    const { handleLogin } = await import('@/admin/handlers/auth-handler');
    const res = await handleLogin(
      post({ email: 'stranger@example.com', password: 'Correct-Horse-Battery-Staple' }),
    );
    expect(res.status).toBe(401);
  });

  it('refuses a cross-origin login attempt', async () => {
    const { handleLogin } = await import('@/admin/handlers/auth-handler');
    const res = await handleLogin(
      post(
        { email: 'owner@example.com', password: 'Correct-Horse-Battery-Staple' },
        { origin: 'https://evil.example' },
      ),
    );
    expect(res.status).toBe(403);
  });

  it('changing the password invalidates every existing session', async () => {
    const { handleLogin, handleChangePassword } = await import('@/admin/handlers/auth-handler');
    const { getSession } = await import('@/cms/store');

    const loginRes = await handleLogin(
      post({ email: 'owner@example.com', password: 'Correct-Horse-Battery-Staple' }),
    );
    const token = /ablin_admin_session=([^;]+)/.exec(loginRes.headers.get('set-cookie') ?? '')?.[1];
    expect(token).toBeTruthy();
    expect(await getSession(token!)).not.toBeNull();

    const changeRes = await handleChangePassword(
      post({
        currentPassword: 'Correct-Horse-Battery-Staple',
        newPassword: 'New-Password-Twelve-Chars',
        confirmPassword: 'New-Password-Twelve-Chars',
      }),
      'admin-1',
    );
    expect(changeRes.status).toBe(200);
    expect(await getSession(token!)).toBeNull();

    // The old password no longer works; the new one does.
    expect(
      (
        await handleLogin(
          post({ email: 'owner@example.com', password: 'Correct-Horse-Battery-Staple' }),
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await handleLogin(
          post({ email: 'owner@example.com', password: 'New-Password-Twelve-Chars' }),
        )
      ).status,
    ).toBe(200);
  });

  it('a password reset consumes the token exactly once', async () => {
    const { handleResetConfirm } = await import('@/admin/handlers/auth-handler');
    const { createResetToken } = await import('@/cms/store');
    await createResetToken('reset-tok', { adminId: 'admin-1' });

    const first = await handleResetConfirm(
      post({
        token: 'reset-tok',
        newPassword: 'Another-New-Password-1',
        confirmPassword: 'Another-New-Password-1',
      }),
    );
    expect(first.status).toBe(200);

    const replay = await handleResetConfirm(
      post({
        token: 'reset-tok',
        newPassword: 'Yet-Another-Password-2',
        confirmPassword: 'Yet-Another-Password-2',
      }),
    );
    expect(replay.status).toBe(400);
  });
});

describe('pages handler', () => {
  it('save-draft leaves the live page unchanged; publish makes the edit live', async () => {
    const { putPage } = await import('@/cms/store');
    const { handlePutPage } = await import('@/admin/handlers/pages-handler');

    await putPage({
      slug: 'about',
      title: 'About Ablin',
      seoTitle: 'About Ablin',
      seoDescription: 'd',
      ogImage: '',
      blocks: [],
      status: 'published',
      updatedAt: new Date().toISOString(),
    });

    const draftRes = await handlePutPage(
      post({
        title: 'About Ablin (draft edit)',
        seoTitle: 'About Ablin',
        seoDescription: 'd',
        ogImage: '',
        blocks: [],
        publish: false,
      }),
      'about',
    );
    expect(draftRes.status).toBe(200);
    const { getPage } = await import('@/cms/store');
    let doc = await getPage('about');
    expect(doc?.title).toBe('About Ablin');
    expect(doc?.draft?.title).toBe('About Ablin (draft edit)');

    const publishRes = await handlePutPage(
      post({
        title: 'About Ablin (published)',
        seoTitle: 'About Ablin',
        seoDescription: 'd',
        ogImage: '',
        blocks: [],
        publish: true,
      }),
      'about',
    );
    expect(publishRes.status).toBe(200);
    doc = await getPage('about');
    expect(doc?.title).toBe('About Ablin (published)');
    expect(doc?.draft).toBeUndefined();
  });

  it('rejects a page write for a slug outside the fixed ten', async () => {
    const { handlePutPage } = await import('@/admin/handlers/pages-handler');
    const res = await handlePutPage(
      post({
        title: 't',
        seoTitle: 't',
        seoDescription: 'd',
        ogImage: '',
        blocks: [],
        publish: true,
      }),
      'made-up-page',
    );
    expect(res.status).toBe(404);
  });

  it('rejects a capabilityGrid block that links to a service slug that does not exist', async () => {
    const { handlePutPage } = await import('@/admin/handlers/pages-handler');
    const res = await handlePutPage(
      post({
        title: 't',
        seoTitle: 't',
        seoDescription: 'd',
        ogImage: '',
        blocks: [
          {
            id: 'c-1',
            type: 'capabilityGrid',
            data: {
              title: 't',
              lead: 'l',
              items: [
                {
                  title: 't',
                  description: 'd',
                  serviceSlug: 'not-a-real-service',
                  illustration: 'structure',
                },
              ],
            },
          },
        ],
        publish: true,
      }),
      'home',
    );
    expect(res.status).toBe(422);
    expect((await res.json()) as { error: string }).toMatchObject({ error: 'invalid_reference' });
  });
});

describe('insights handler', () => {
  it('creates a draft, then publish/unpublish move it between the index sets', async () => {
    const { handleCreateInsight, handlePublishInsight, handleUnpublishInsight } =
      await import('@/admin/handlers/insights-handler');
    const { listDraftSlugs, listPublishedSlugs } = await import('@/cms/store');

    const createRes = await handleCreateInsight(
      post({
        slug: 'test-article',
        title: 'Test article',
        excerpt: 'e',
        topics: [],
        blocks: [],
        seoTitle: 't',
        seoDescription: 'd',
      }),
    );
    expect(createRes.status).toBe(201);
    expect(await listDraftSlugs()).toContain('test-article');
    expect(await listPublishedSlugs()).not.toContain('test-article');

    const publishRes = await handlePublishInsight('test-article');
    expect(publishRes.status).toBe(200);
    expect(await listPublishedSlugs()).toContain('test-article');
    expect(await listDraftSlugs()).not.toContain('test-article');

    const unpublishRes = await handleUnpublishInsight('test-article');
    expect(unpublishRes.status).toBe(200);
    expect(await listDraftSlugs()).toContain('test-article');
    expect(await listPublishedSlugs()).not.toContain('test-article');
  });

  it('refuses to create two articles with the same slug', async () => {
    const { handleCreateInsight } = await import('@/admin/handlers/insights-handler');
    const body = {
      slug: 'dup-slug',
      title: 'T',
      excerpt: 'e',
      topics: [],
      blocks: [],
      seoTitle: 't',
      seoDescription: 'd',
    };
    expect((await handleCreateInsight(post(body))).status).toBe(201);
    expect((await handleCreateInsight(post(body))).status).toBe(409);
  });

  it('editing a published article stages a draft rather than changing what is live', async () => {
    const { handleCreateInsight, handlePublishInsight, handleUpdateInsight } =
      await import('@/admin/handlers/insights-handler');
    await handleCreateInsight(
      post({
        slug: 'live-article',
        title: 'Original',
        excerpt: 'e',
        topics: [],
        blocks: [],
        seoTitle: 't',
        seoDescription: 'd',
      }),
    );
    await handlePublishInsight('live-article');

    const editRes = await handleUpdateInsight(
      post({
        title: 'Edited',
        excerpt: 'e',
        topics: [],
        blocks: [],
        seoTitle: 't',
        seoDescription: 'd',
      }),
      'live-article',
    );
    expect(editRes.status).toBe(200);

    const { getArticle } = await import('@/cms/store');
    const doc = await getArticle('live-article');
    expect(doc?.title).toBe('Original');
    expect(doc?.draft?.title).toBe('Edited');
  });
});

describe('submissions handler', () => {
  it('PATCH updates status and GET reflects it', async () => {
    const { putSubmission } = await import('@/cms/store');
    const { handleGetSubmission, handlePatchSubmission } =
      await import('@/admin/handlers/submissions-handler');
    await putSubmission({
      id: 'sub-1',
      fullName: 'A',
      email: 'a@example.com',
      organisation: '',
      enquiryType: 'general',
      message: 'm',
      consent: true,
      sourcePath: '/contact',
      status: 'unread',
      createdAt: new Date().toISOString(),
    });

    const patchRes = await handlePatchSubmission(post({ status: 'archived' }), 'sub-1');
    expect(patchRes.status).toBe(200);

    const getRes = await handleGetSubmission('sub-1');
    expect((await getRes.json()) as { status: string }).toMatchObject({ status: 'archived' });
  });

  it('404s for an id that does not exist', async () => {
    const { handleGetSubmission } = await import('@/admin/handlers/submissions-handler');
    expect((await handleGetSubmission('does-not-exist')).status).toBe(404);
  });
});

describe('settings handler', () => {
  it('round-trips the availability mode and message', async () => {
    const { handleGetAvailability, handlePutAvailability } =
      await import('@/admin/handlers/settings-handler');
    const putRes = await handlePutAvailability(post({ mode: 'coming_soon', message: 'Back soon' }));
    expect(putRes.status).toBe(200);

    const getRes = await handleGetAvailability();
    expect((await getRes.json()) as { mode: string; message: string }).toMatchObject({
      mode: 'coming_soon',
      message: 'Back soon',
    });
  });
});
