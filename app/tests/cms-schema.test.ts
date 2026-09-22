import { describe, expect, it } from 'vitest';
import {
  articleDocSchema,
  blockSchema,
  pageDocSchema,
  submissionSchema,
  type Block,
} from '@/cms/schema';

const heroHome: Block = {
  id: 'hero-1',
  type: 'hero',
  data: {
    variant: 'home',
    eyebrow: 'e',
    title: 't',
    lead: 'l',
    primary: { label: 'Go', href: '/contact' },
    secondary: { label: 'Go', href: '/contact' },
    frameworksLabel: 'f',
    frameworkNames: ['ISO 27001'],
  },
};

describe('blockSchema', () => {
  it('accepts a valid hero (home variant) block', () => {
    expect(blockSchema.safeParse(heroHome).success).toBe(true);
  });

  it('rejects a block whose data does not match its declared variant', () => {
    const bad = { ...heroHome, data: { ...heroHome.data, variant: 'page' } };
    expect(blockSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an unknown block type', () => {
    const bad = { id: 'x', type: 'video', data: {} };
    expect(blockSchema.safeParse(bad).success).toBe(false);
  });

  it('requires approachSteps to have exactly 5 steps', () => {
    const step = { title: 't', description: 'd' };
    const base = { id: 'a-1', type: 'approachSteps' as const };
    expect(
      blockSchema.safeParse({
        ...base,
        data: { kicker: 'k', title: 't', lead: 'l', steps: Array(5).fill(step) },
      }).success,
    ).toBe(true);
    expect(
      blockSchema.safeParse({
        ...base,
        data: { kicker: 'k', title: 't', lead: 'l', steps: Array(4).fill(step) },
      }).success,
    ).toBe(false);
  });

  it('requires an image block url to be site-relative or https', () => {
    const base = { id: 'img-1', type: 'image' as const };
    const ok = (url: string) =>
      blockSchema.safeParse({
        ...base,
        data: { url, alt: '', width: 10, height: 10, blur: 'data:image/gif;base64,x' },
      }).success;
    expect(ok('/image/photo/x.jpg')).toBe(true);
    expect(ok('https://res.cloudinary.com/x/image/upload/y.jpg')).toBe(true);
    expect(ok('http://insecure.example/y.jpg')).toBe(false);
    expect(ok('javascript:alert(1)')).toBe(false);
  });

  it('rejects a capabilityGrid with zero items', () => {
    const base = { id: 'c-1', type: 'capabilityGrid' as const };
    expect(
      blockSchema.safeParse({ ...base, data: { title: 't', lead: 'l', items: [] } }).success,
    ).toBe(false);
  });
});

describe('pageDocSchema', () => {
  it('accepts a published page with no draft', () => {
    const doc = {
      slug: 'home',
      title: 'Home',
      seoTitle: 'Home',
      seoDescription: 'Home',
      ogImage: '',
      blocks: [heroHome],
      status: 'published',
      updatedAt: new Date().toISOString(),
    };
    expect(pageDocSchema.safeParse(doc).success).toBe(true);
  });

  it('accepts a published page carrying a staged, unpublished draft', () => {
    const fields = {
      title: 'Home',
      seoTitle: 'Home',
      seoDescription: 'Home',
      ogImage: '',
      blocks: [heroHome],
    };
    const doc = {
      slug: 'home',
      ...fields,
      status: 'published',
      updatedAt: new Date().toISOString(),
      draft: { ...fields, updatedAt: new Date().toISOString() },
    };
    expect(pageDocSchema.safeParse(doc).success).toBe(true);
  });
});

describe('articleDocSchema', () => {
  it('rejects a slug with uppercase letters or spaces', () => {
    const fields = {
      title: 't',
      excerpt: 'e',
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
