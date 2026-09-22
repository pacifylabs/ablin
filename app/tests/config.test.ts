import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from '@/lib/config';

describe('resolveSiteUrl', () => {
  it('uses SITE_URL when it is set', () => {
    expect(resolveSiteUrl({ SITE_URL: 'https://ablin.example' })).toBe('https://ablin.example');
  });

  // Regression: a blank SITE_URL saved in the hosting dashboard crashed the production build (`new URL("")`).
  it.each(['', '   '])('treats a blank SITE_URL (%j) as unset instead of crashing', (blank) => {
    expect(resolveSiteUrl({ SITE_URL: blank })).toBe('http://localhost:3000');
  });

  it('falls back to the Vercel production domain, then the deployment URL', () => {
    expect(
      resolveSiteUrl({
        SITE_URL: '',
        VERCEL_PROJECT_PRODUCTION_URL: 'ablin.vercel.app',
        VERCEL_URL: 'ablin-abc.vercel.app',
      }),
    ).toBe('https://ablin.vercel.app');
    expect(resolveSiteUrl({ VERCEL_URL: 'ablin-abc.vercel.app' })).toBe(
      'https://ablin-abc.vercel.app',
    );
  });

  it('prefers an explicit SITE_URL over Vercel variables', () => {
    expect(
      resolveSiteUrl({ SITE_URL: 'https://ablin.co.uk', VERCEL_URL: 'ablin-abc.vercel.app' }),
    ).toBe('https://ablin.co.uk');
  });

  it('normalises to an origin so joined paths never contain a double slash', () => {
    expect(resolveSiteUrl({ SITE_URL: 'https://ablin.co.uk/' })).toBe('https://ablin.co.uk');
    expect(resolveSiteUrl({ SITE_URL: 'https://ablin.co.uk/en/home?x=1' })).toBe(
      'https://ablin.co.uk',
    );
  });

  it('fails loudly, naming the variable, when SITE_URL is set but not a URL', () => {
    expect(() => resolveSiteUrl({ SITE_URL: 'ablin.co.uk' })).toThrow(
      /SITE_URL must be a full URL/,
    );
  });

  it('defaults to localhost with nothing configured', () => {
    expect(resolveSiteUrl({})).toBe('http://localhost:3000');
  });
});
