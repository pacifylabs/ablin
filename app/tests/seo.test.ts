import { describe, expect, it } from 'vitest';
import { buildPageMetadata } from '@/lib/seo';

describe('buildPageMetadata', () => {
  it('sets canonical path and truncates long descriptions for OG', () => {
    const meta = buildPageMetadata({
      title: 'About Ablin',
      description: 'Short description.',
      path: '/about',
    });
    expect(meta.alternates?.canonical).toBe('/about');
    expect(meta.openGraph?.url).toBe('/about');
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('supports absolute titles and article type', () => {
    const meta = buildPageMetadata({
      title: 'Ablin Limited — Home',
      description: 'Lead.',
      path: '/',
      absoluteTitle: true,
      openGraphType: 'article',
    });
    expect(meta.title).toEqual({ absolute: 'Ablin Limited — Home' });
    expect(meta.openGraph).toMatchObject({ type: 'article' });
  });
});
