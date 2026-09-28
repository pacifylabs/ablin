import { describe, expect, it } from 'vitest';
import {
  articleDocSchema,
  blockSchema,
  pageDocSchema,
  submissionSchema,
  type Block,
} from '@/cms/schema';

import { BLOCK_TYPES, PALETTE, duplicateBlock, newBlock } from '@/cms/blocks';

const hero = {
  ...newBlock('heroFramed', 'hero-1'),
  data: {
    eyebrow: 'e',
    title: 't',
    lead: 'l',
    image: { mediaId: 'glass-converge', decorative: true },
    locationTag: 'UNITED KINGDOM',
    primaryCta: { label: 'Go', href: '/services' },
    secondaryCta: null,
    lattice: true,
  },
} as Block;

describe('block palette (DS v3 §9)', () => {
  it('is exactly the closed twenty-block palette', () => {
    expect(BLOCK_TYPES).toEqual([
      'pageHeader',
      'heroFramed',
      'capabilityPanels',
      'aboutIntro',
      'factStrip',
      'frameworkStrip',
      'serviceCarousel',
      'approachSplit',
      'approachSteps',
      'audienceList',
      'splitImage',
      'whyGrid',
      'valuesGrid',
      'missionVision',
      'topicList',
      'articleGrid',
      'richText',
      'image',
      'ctaBand',
      'contactBand',
    ]);
  });

  it('every block carries anchorId, background and visible', () => {
    for (const type of BLOCK_TYPES) {
      const block = newBlock(type, `${type}-1`);
      expect(block).toMatchObject({ anchorId: '', visible: true });
      expect(['bg', 'surface', 'band']).toContain(block.background);
      expect(block.background).toBe(PALETTE[type].bg);
    }
  });

  it('accepts a valid hero and rejects an unknown type', () => {
    expect(blockSchema.safeParse(hero).success).toBe(true);
    expect(blockSchema.safeParse({ ...hero, type: 'video' }).success).toBe(false);
  });

  it('rejects unsafe links and bad anchors', () => {
    const bad = {
      ...hero,
      data: { ...hero.data, primaryCta: { label: 'Go', href: 'javascript:alert(1)' } },
    };
    expect(blockSchema.safeParse(bad).success).toBe(false);
    expect(blockSchema.safeParse({ ...hero, anchorId: 'Has Spaces' }).success).toBe(false);
    expect(blockSchema.safeParse({ ...hero, background: 'red' }).success).toBe(false);
  });

  it('holds images as media references only, never raw URLs', () => {
    const raw = { ...hero, data: { ...hero.data, image: { url: 'https://example.com/x.jpg' } } };
    expect(blockSchema.safeParse(raw).success).toBe(false);
  });

  it('caps capability panels at three and fact strips at four', () => {
    const panel = { icon: 'shield', title: 't', text: 'x', link: { label: 'l', href: '/' } };
    const caps = { ...newBlock('capabilityPanels', 'c'), data: { panels: Array(4).fill(panel) } };
    expect(blockSchema.safeParse(caps).success).toBe(false);
    const facts = {
      ...newBlock('factStrip', 'f'),
      data: { facts: Array(5).fill({ value: '1', label: 'x' }), approvedByClient: true },
    };
    expect(blockSchema.safeParse(facts).success).toBe(false);
  });

  it('duplicate gives a new id and clears the anchor', () => {
    const copy = duplicateBlock({ ...hero, anchorId: 'top' }, 'hero-2');
    expect(copy.id).toBe('hero-2');
    expect(copy.anchorId).toBe('');
    expect(copy.data).toEqual(hero.data);
  });
});

describe('pageDocSchema', () => {
  const fields = {
    title: 'Home',
    seoTitle: 'Home',
    seoDescription: 'Home',
    ogImage: null,
    noindex: false,
    blocks: [hero],
  };

  it('accepts a published page with no draft', () => {
    const doc = {
      slug: 'home',
      ...fields,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };
    expect(pageDocSchema.safeParse(doc).success).toBe(true);
  });

  it('accepts a published page carrying a staged, unpublished draft', () => {
    const doc = {
      slug: 'home',
      ...fields,
      status: 'published',
      updatedAt: new Date().toISOString(),
      draft: { ...fields, updatedAt: new Date().toISOString() },
    };
    expect(pageDocSchema.safeParse(doc).success).toBe(true);
  });

  it('rejects a v2 page document (so the public site serves the bundled v3 page instead)', () => {
    const legacy = {
      slug: 'home',
      title: 'Home',
      seoTitle: 'Home',
      seoDescription: 'Home',
      ogImage: '',
      blocks: [{ id: 'hero-1', type: 'hero', data: {} }],
      status: 'published',
      updatedAt: new Date().toISOString(),
    };
    expect(pageDocSchema.safeParse(legacy).success).toBe(false);
  });
});

describe('articleDocSchema', () => {
  it('rejects a slug with uppercase letters or spaces', () => {
    const fields = {
      title: 't',
      excerpt: 'e',
      coverImage: null,
      topics: [],
      blocks: [],
      seoTitle: 't',
      seoDescription: 'd',
    };
    const now = new Date().toISOString();
    expect(
      articleDocSchema.safeParse({ slug: 'My Article', ...fields, status: 'draft', updatedAt: now })
        .success,
    ).toBe(false);
    expect(
      articleDocSchema.safeParse({ slug: 'my-article', ...fields, status: 'draft', updatedAt: now })
        .success,
    ).toBe(true);
  });
});

describe('submissionSchema', () => {
  it('accepts only the three known statuses', () => {
    const base = {
      id: '1',
      fullName: 'A',
      email: 'a@example.com',
      organisation: '',
      enquiryType: 'general',
      message: 'm',
      consent: true,
      sourcePath: '/contact',
      createdAt: new Date().toISOString(),
    };
    for (const status of ['unread', 'read', 'archived']) {
      expect(submissionSchema.safeParse({ ...base, status }).success).toBe(true);
    }
    expect(submissionSchema.safeParse({ ...base, status: 'deleted' }).success).toBe(false);
  });
});
