import { cache } from 'react';
import { z } from 'zod';
import { cachedQuery } from '../cached';
import { optionalTextSchema, textSchema } from '../fields';
import { keys } from '../keys';
import { redis } from '../redis';
import servicesJson from '@/content/services.json';
import { blockSchema, newBlock, type Block } from '../blocks';
import type { RichDoc } from '../richdoc';
import approachJson from '@/content/approach.json';
import { mediaRefSchema } from './media-schema';

/**
 * Services (DS v3 §9): one `services:{slug}` document each, ordered by `services:index` (a sorted set scored by
 * `order`). Cards (carousel, footer, related) read the card fields; /services/{slug} renders `blocks`.
 * Any service write expires both its own key and `services:index`, which every listing is tagged with.
 */
import { SERVICE_SLUG } from './service-rules';

export { SERVICE_SLUG };

export const serviceSchema = z.object({
  slug: z.string().regex(SERVICE_SLUG, 'Lowercase letters, numbers and hyphens; not "index"'),
  order: z.number().int().min(0),
  /** Short pill on the card, e.g. GRC, ISO, SOC 2. */
  code: textSchema.max(12),
  title: textSchema,
  /** One line for cards. */
  summary: textSchema,
  cardImage: mediaRefSchema.nullable(),
  seoTitle: optionalTextSchema,
  seoDescription: optionalTextSchema,
  /** The detail page, from the closed palette (DS v3 §7.14). */
  blocks: z.array(blockSchema),
});
export type Service = z.infer<typeof serviceSchema>;

export function serviceHref(slug: string): string {
  return `/services/${slug}`;
}

// --- seed ------------------------------------------------------------------------------------------------------

type LegacyService = {
  slug: string;
  title: string;
  summary: string;
  definition: string;
  covers: string[];
  howWeWork: string[];
  whoFor: string[];
  related: string[];
  ctaTitle: string;
};

/**
 * Each service page's own header photo (main's picks, client-approved, including two people photos), distinct across
 * the eight services. Cards use a separate architectural photo.
 */
const SEED_HEADER: Record<string, string> = {
  'governance-risk-compliance': 'review-documents',
  'iso-compliance-readiness': 'geometric-facade',
  'data-protection-privacy': 'colleagues-desk',
  'ai-governance': 'glass-facade',
  'cybersecurity-governance': 'hero-stairs',
  'technology-risk-it-controls': 'light-stairs',
  'soc2-controls-readiness': 'zigzag-stairs',
  'audit-assurance-regulatory-readiness': 'tower-clouds',
};

const SEED_CARD: Record<string, { code: string; image: string }> = {
  'governance-risk-compliance': { code: 'GRC', image: 'glass-facade' },
  'iso-compliance-readiness': { code: 'ISO', image: 'tower-sky' },
  'data-protection-privacy': { code: 'DATA', image: 'zigzag-stairs' },
  'ai-governance': { code: 'AI', image: 'curved-tower' },
  'cybersecurity-governance': { code: 'CYBER', image: 'reflective-facade' },
  'technology-risk-it-controls': { code: 'IT', image: 'glass-towers' },
  'soc2-controls-readiness': { code: 'SOC 2', image: 'stepped-glass' },
  'audit-assurance-regulatory-readiness': { code: 'AUDIT', image: 'light-stairs' },
};

function checklistDoc(items: readonly string[]): RichDoc {
  return {
    type: 'doc',
    content: [
      {
        type: 'bulletList',
        content: items.map((item) => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
        })),
      },
    ],
  };
}

/** The DS v3 §7.14 detail template, built from the v2 service JSON. */
function detailBlocks(s: LegacyService, code: string, image: string | undefined): Block[] {
  const id = (n: string) => `${s.slug}-${n}`;
  const header = newBlock('pageHeader', id('header'));
  header.data = {
    eyebrow: code,
    title: s.title,
    lead: s.definition,
    image: image ? { mediaId: image, decorative: true } : null,
    breadcrumb: true,
    cta: null,
  };
  const covers = newBlock('richText', id('covers'));
  covers.data = {
    title: 'What this covers',
    meta: '',
    doc: checklistDoc(s.covers),
    layout: 'checklist',
  };
  const how = newBlock('approachSteps', id('how'));
  how.data = {
    eyebrow: '',
    title: 'How we work on this',
    lead: 'The same five steps apply to every service, applied here to this work.',
    steps: s.howWeWork.map((text, i) => ({ title: approachJson.steps[i]?.title ?? '', text })),
    compact: true,
  };
  const related = newBlock('serviceCarousel', id('related'));
  related.data = {
    variant: 'grid',
    eyebrow: '',
    title: 'Related services',
    lead: '',
    serviceSlugs: s.related,
    cardLinkLabel: 'View service',
    prevLabel: 'Previous services',
    nextLabel: 'Next services',
    trackLabel: 'Related services',
  };
  const contact = newBlock('contactBand', id('contact'));
  contact.data = {
    title: s.ctaTitle,
    sub: 'Tell us what you are working towards and we will advise on where to start.',
    checklist: [],
  };
  return [header, covers, how, related, contact];
}

export function fromLegacyService(s: LegacyService, order: number): Service {
  const card = SEED_CARD[s.slug];
  const code = card?.code ?? s.title.slice(0, 4).toUpperCase();
  return {
    slug: s.slug,
    order,
    code,
    title: s.title,
    summary: s.summary,
    cardImage: card ? { mediaId: card.image, decorative: true } : null,
    seoTitle: s.title,
    seoDescription: `${s.summary} ${s.definition}`.slice(0, 300),
    blocks: detailBlocks(s, code, SEED_HEADER[s.slug] ?? card?.image),
  };
}

export const SEED_SERVICES: readonly Service[] = z
  .array(serviceSchema)
  .parse((servicesJson as LegacyService[]).map((s, i) => fromLegacyService(s, i)));

// --- public reads (cached) ------------------------------------------------------------------------------------

async function fetchAll(): Promise<unknown[] | null> {
  const slugs = await redis().zrange<string[]>(keys.servicesIndex, 0, -1);
  if (slugs.length === 0) return null;
  return redis().mget<unknown[]>(...slugs.map((s) => keys.service(s)));
}

/** Every service in display order. Falls back to the bundled seed if the collection is empty or Redis is down. */
export const listServices = cache(async (): Promise<readonly Service[]> => {
  try {
    const raw = await cachedQuery([keys.servicesIndex], ['services'], fetchAll);
    if (!raw) return SEED_SERVICES;
    const out: Service[] = [];
    for (const doc of raw) {
      const parsed = serviceSchema.safeParse(doc);
      if (parsed.success) out.push(parsed.data);
      else if (doc !== null) console.error('A stored service failed validation and was skipped.');
    }
    return out.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Failed to list services from Redis; serving the bundled seed.', error);
    return SEED_SERVICES;
  }
});

/** From the listing, so a service deleted in the admin can never be resurrected by the seed fallback. */
export const getService = cache(async (slug: string): Promise<Service | null> => {
  if (!SERVICE_SLUG.test(slug)) return null;
  return (await listServices()).find((s) => s.slug === slug) ?? null;
});

// --- admin (uncached) ----------------------------------------------------------------------------------------

export async function readService(slug: string): Promise<Service | null> {
  const raw = await redis().get(keys.service(slug));
  return raw ? serviceSchema.parse(raw) : null;
}

export async function listServicesRaw(): Promise<Service[]> {
  const raw = await fetchAll();
  if (!raw) return [];
  return raw
    .flatMap((d) => {
      const parsed = serviceSchema.safeParse(d);
      return parsed.success ? [parsed.data] : [];
    })
    .sort((a, b) => a.order - b.order);
}

export async function putService(service: Service): Promise<void> {
  const r = redis();
  await r.set(keys.service(service.slug), service);
  await r.zadd(keys.servicesIndex, { score: service.order, member: service.slug });
}

export async function deleteService(slug: string): Promise<void> {
  const r = redis();
  await r.del(keys.service(slug));
  await r.zrem(keys.servicesIndex, slug);
}
