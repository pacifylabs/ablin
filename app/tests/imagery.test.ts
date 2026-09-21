import { describe, expect, it } from 'vitest';
import { frameworkSchema, imagesSchema } from '@/content/schema';
import { getFrameworks, getImages } from '@/lib/content';

const base = {
  id: 'soc-2',
  name: 'SOC 2',
  scope: 'Service organisation controls',
  publisher: 'AICPA',
  sources: [{ label: 'SOC on aicpa-cima.com', url: 'https://www.aicpa-cima.com/' }],
} as const;

describe('framework references', () => {
  it('names each framework precisely and links to an authoritative https source', async () => {
    for (const framework of await getFrameworks()) {
      expect(framework.publisher.length, framework.id).toBeGreaterThan(1);
      expect(framework.sources.length, framework.id).toBeGreaterThan(0);
      for (const source of framework.sources)
        expect(source.url, framework.id).toMatch(/^https:\/\//);
    }
  });

  it('rejects a framework with no source', () => {
    expect(frameworkSchema.safeParse({ ...base, sources: [] }).success).toBe(false);
    expect(
      frameworkSchema.safeParse({
        ...base,
        sources: [{ label: 'x', url: 'http://insecure.example' }],
      }).success,
    ).toBe(false);
  });
});

describe('framework logo slot', () => {
  it('ships with no official logos: custom badges only, until the client approves some', async () => {
    for (const framework of await getFrameworks())
      expect(framework.logo, framework.id).toBeUndefined();
  });

  it('accepts a logo only when approval and licence reference are both recorded', () => {
    const logo = { src: '/image/logos/soc2.svg', alt: 'SOC 2 logo', width: 80, height: 80 };
    expect(
      frameworkSchema.safeParse({
        ...base,
        logo: { ...logo, approvedBy: 'A. Client', licenceRef: 'LIC-1' },
      }).success,
    ).toBe(true);
    expect(frameworkSchema.safeParse({ ...base, logo }).success).toBe(false);
    expect(
      frameworkSchema.safeParse({ ...base, logo: { ...logo, approvedBy: 'A. Client' } }).success,
    ).toBe(false);
    expect(
      frameworkSchema.safeParse({ ...base, logo: { ...logo, licenceRef: 'LIC-1' } }).success,
    ).toBe(false);
    expect(
      frameworkSchema.safeParse({ ...base, logo: { ...logo, approvedBy: '', licenceRef: 'LIC-1' } })
        .success,
    ).toBe(false);
  });
});

describe('image manifest', () => {
  it('records source and licence for every photograph and flags stand-ins as placeholders', async () => {
    const images = await getImages();
    expect(Object.keys(images).length).toBeGreaterThan(0);
    for (const [id, image] of Object.entries(images)) {
      expect(image.credit.licence, id).toBe('Unsplash License');
      expect(image.credit.url, id).toMatch(/^https:\/\/unsplash\.com\/photos\//);
      expect(image.status, id).toBe('placeholder');
    }
  });

  it('gives meaningful images alt text and leaves decorative ones empty', async () => {
    for (const [id, image] of Object.entries(await getImages())) {
      if (image.decorative) expect(image.alt, id).toBe('');
      else expect(image.alt.length, id).toBeGreaterThan(10);
    }
  });

  it('rejects entries that are missing required fields', () => {
    expect(imagesSchema.safeParse({ x: { src: '/a.jpg' } }).success).toBe(false);
  });
});
