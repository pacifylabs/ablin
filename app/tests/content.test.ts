import { describe, expect, it } from 'vitest';
import { seedPage, seedPages } from '@/cms/seed-data';
import { SEED_SERVICES } from '@/cms/collections/services';
import audiences from '@/content/audiences.json';
import { GLOBALS, GLOBAL_NAMES } from '@/cms/globals';

// Copy the admin will edit is validated at import time (lib/content.ts) or, for pages/articles, by cms/schema.ts
// at save time. These tests guard the rules that schema validation cannot express.

const HYPE = [
  'cutting-edge',
  'revolutionary',
  'seamless',
  'empower',
  'unlock',
  'elevate',
  'robust solutions',
  'fast-paced',
  'best-in-class',
  'game-changing',
  'synergies',
];

async function allText(): Promise<string> {
  // Most page copy now lives in cms/seed-data.ts (Home, About, Services, Who We Serve, Insights and the four
  // legal pages) rather than these JSON files, which now only hold the "master data" and the pinned, non-block
  // sections (see admin/README.md). Both are scanned, so this test still covers everything the site says.
  const modules = await Promise.all(
    ['about', 'services', 'insights', 'audiences'].map(async (name) =>
      JSON.stringify((await import(`@/content/${name}.json`)).default),
    ),
  );
  modules.push(JSON.stringify(seedPages), JSON.stringify(SEED_SERVICES));
  for (const name of GLOBAL_NAMES) modules.push(JSON.stringify(GLOBALS[name].seed));
  return modules.join(' ').toLowerCase();
}

describe('content integrity', () => {
  it('contains all eight services with unique slugs', async () => {
    const services = SEED_SERVICES;
    expect(services).toHaveLength(8);
    expect(new Set(services.map((s) => s.slug)).size).toBe(8);
  });

  it('maps every audience to at least one service', async () => {
    for (const audience of audiences) expect(audience.services.length).toBeGreaterThan(0);
  });

  it('uses none of the banned hype vocabulary', async () => {
    const text = await allText();
    for (const word of HYPE) expect(text, word).not.toContain(word);
  });

  it('contains no fabricated proof language', async () => {
    const text = await allText();
    for (const phrase of [
      'trusted by',
      'certified by us',
      'we are certified',
      'accredited',
      'award-winning',
      'testimonial',
    ]) {
      expect(text, phrase).not.toContain(phrase);
    }
  });

  it('never presents Ablin as issuing certificates on the certification-related services', async () => {
    for (const slug of ['iso-compliance-readiness', 'soc2-controls-readiness']) {
      const service = SEED_SERVICES.find((s) => s.slug === slug);
      expect(JSON.stringify(service?.blocks)).toMatch(/independent/i);
    }
  });

  it('keeps unreviewed legal pages out of search indexes', () => {
    for (const slug of [
      'privacy-policy',
      'cookie-policy',
      'terms-of-use',
      'accessibility',
    ] as const) {
      expect(seedPage(slug).noindex).toBe(true);
    }
  });

  it('seeds every page slug, and every seed page is valid', async () => {
    const { PAGE_SLUGS, pageDocSchema } = await import('@/cms/schema');
    for (const slug of PAGE_SLUGS)
      expect(pageDocSchema.safeParse(seedPage(slug)).success, slug).toBe(true);
  });

  it('seeds the Home page in the DS v3 order', () => {
    expect(seedPage('home').blocks.map((b) => b.type)).toEqual([
      'heroFramed',
      'capabilityPanels',
      'aboutIntro',
      'factStrip',
      'frameworkStrip',
      'serviceCarousel',
      'approachSplit',
      'audienceList',
      'whyGrid',
      'topicList',
      'articleGrid',
      'contactBand',
    ]);
  });

  it('uses only service-structure counts in the fact strip (DS v3 §7.5 integrity rule)', () => {
    const facts = seedPage('home').blocks.find((b) => b.type === 'factStrip');
    expect(facts?.type === 'factStrip' && facts.data.facts.map((f) => f.value)).toEqual([
      '3',
      '8',
      '5',
      '5',
    ]);
  });
});
