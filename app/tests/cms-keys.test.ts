import { describe, expect, it } from 'vitest';
import { keys } from '@/cms/keys';

describe('cms key builders', () => {
  it('match the schema given in the build brief exactly', () => {
    expect(keys.adminUser).toBe('admin:user');
    expect(keys.session('abc')).toBe('session:abc');
    expect(keys.sessionsIndex).toBe('sessions:index');
    expect(keys.reset('abc')).toBe('reset:abc');
    expect(keys.availability).toBe('settings:availability');
    expect(keys.page('home')).toBe('page:home');
    expect(keys.pagesIndex).toBe('pages:index');
    expect(keys.article('my-slug')).toBe('insights:article:my-slug');
    expect(keys.articlesIndex).toBe('insights:index');
    expect(keys.articleDrafts).toBe('insights:drafts');
    expect(keys.legacyTopicsIndex).toBe('topics:index');
    expect(keys.topics).toBe('topics');
    expect(keys.frameworksList).toBe('frameworks');
    expect(keys.service('grc')).toBe('services:grc');
    expect(keys.servicesIndex).toBe('services:index');
    expect(keys.media('x')).toBe('media:x');
    expect(keys.mediaIndex).toBe('media:index');
    expect(keys.submission('123')).toBe('submission:123');
    expect(keys.submissionsIndex).toBe('submissions:index');
  });

  it("rate-limit keys are namespaced by scope and identity, not in the brief's schema", () => {
    expect(keys.rateLimit('login', 'abcd')).toBe('ratelimit:login:abcd');
  });
});
