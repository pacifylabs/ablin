import { describe, expect, it } from 'vitest';
import { getAudiences, getLegalPage, getServices } from '@/lib/content';

// Copy the admin will edit is validated at import time (lib/content.ts). These tests guard the rules
// that schema validation cannot express.

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
  const modules = await Promise.all(
    [
      'home',
      'about',
      'services',
      'services-page',
      'who-we-serve',
      'insights',
      'contact',
      'audiences',
      'legal',
    ].map(async (name) => JSON.stringify((await import(`@/content/${name}.json`)).default)),
  );
  return modules.join(' ').toLowerCase();
}

describe('content integrity', () => {
  it('contains all eight services with unique slugs', async () => {
    const services = await getServices();
    expect(services).toHaveLength(8);
    expect(new Set(services.map((s) => s.slug)).size).toBe(8);
  });

  it('maps every audience to at least one service', async () => {
    for (const audience of await getAudiences())
      expect(audience.services.length).toBeGreaterThan(0);
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
    const services = await getServices();
    for (const slug of ['iso-compliance-readiness', 'soc2-controls-readiness']) {
      const service = services.find((s) => s.slug === slug);
      expect(service?.definition).toMatch(/independent/i);
    }
  });

  it('keeps unreviewed legal pages flagged as draft', async () => {
    for (const slug of [
      'privacy-policy',
      'cookie-policy',
      'terms-of-use',
      'accessibility',
    ] as const) {
      expect((await getLegalPage(slug)).reviewStatus).toBe('draft');
    }
  });
});
