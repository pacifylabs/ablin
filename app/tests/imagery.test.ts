import { describe, expect, it } from 'vitest';
import { imagesSchema } from '@/content/schema';
import { SEED_FRAMEWORKS, frameworkSchema, withMarks } from '@/cms/collections/frameworks';
import { SEED_MEDIA } from '@/cms/collections/media';
import { getImages } from '@/lib/content';

const base = SEED_FRAMEWORKS[0]!;

describe('framework references', () => {
  it('names each framework precisely and links to an authoritative https source', () => {
    for (const framework of SEED_FRAMEWORKS) {
      expect(framework.publisher.length, framework.id).toBeGreaterThan(1);
      expect(framework.sources.length, framework.id).toBeGreaterThan(0);
      for (const source of framework.sources)
        expect(source.url, framework.id).toMatch(/^https:\/\//);
    }
  });

  it('rejects an insecure source link', () => {
    expect(
      frameworkSchema.safeParse({
        ...base,
        sources: [{ label: 'x', url: 'http://insecure.example' }],
      }).success,
    ).toBe(false);
  });
});

describe('framework logos (DS v3 §7.6)', () => {
  it('ships with no logos and nothing approved: line icons only', () => {
    for (const f of SEED_FRAMEWORKS) {
      expect(f.logo, f.id).toBeNull();
      expect(f.approvedByClient, f.id).toBe(false);
    }
  });

  it('never renders a logo the client has not approved', async () => {
    const withLogo = { ...base, logo: { mediaId: 'glass-facade', decorative: true } };
    const [unapproved] = await withMarks([{ ...withLogo, approvedByClient: false }]);
    expect(unapproved!.mark).toBeNull();
    const [approved] = await withMarks([{ ...withLogo, approvedByClient: true }]);
    expect(approved!.mark?.src).toBe('/image/photo/glass-facade.jpg');
  });
});

describe('media library seed', () => {
  it('credits every bundled photo to its Unsplash source and gives it alt text', () => {
    for (const m of SEED_MEDIA) {
      expect(m.credit, m.id).toMatch(/^https:\/\/unsplash\.com\/photos\//);
      expect(m.alt.length, m.id).toBeGreaterThan(10);
      expect(m.blur, m.id).toMatch(/^data:image\//);
    }
  });

  it('seeds only architectural photography (no people-at-desk stock, DS v3 §5)', () => {
    const ids = SEED_MEDIA.map((m) => m.id);
    expect(ids).not.toContain('colleagues-desk');
    expect(ids).not.toContain('review-documents');
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
