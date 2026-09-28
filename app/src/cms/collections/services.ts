import { cache } from 'react';
import { z } from 'zod';
import { cachedQuery } from '../cached';
import { optionalTextSchema, textSchema } from '../fields';
import { keys } from '../keys';
import { redis } from '../redis';
import servicesJson from '@/content/services.json';
import { mediaRefSchema } from './media';

/**
 * Services (DS v3 §9): one `services:{slug}` document each, ordered by `services:index` (a sorted set scored by
 * `order`). Cards (carousel, footer, related) read the card fields; /services/{slug} renders the detail.
 * Any service write expires both its own key and `services:index`, which every listing is tagged with.
 */
export const SERVICE_SLUG = /^(?!index$)[a-z0-9][a-z0-9-]{0,63}$/;

export const serviceDetailSchema = z.object({
  definition: textSchema,
  coversTitle: textSchema,
  covers: z.array(textSchema).min(1),
  howTitle: textSchema,
  howLead: optionalTextSchema,
  /** One line per approach step, in order. */
  howWeWork: z.array(textSchema).min(1).max(8),
  whoForTitle: textSchema,
  whoFor: z.array(z.string()),
  relatedTitle: textSchema,
  related: z.array(z.string().regex(SERVICE_SLUG)),
  ctaTitle: textSchema,
  ctaText: textSchema,
});

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
  detail: serviceDetailSchema,
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

export function fromLegacyService(s: LegacyService, order: number): Service {
  const card = SEED_CARD[s.slug];
  return {
    slug: s.slug,
    order,
    code: card?.code ?? s.title.slice(0, 4).toUpperCase(),
    title: s.title,
    summary: s.summary,
    cardImage: card ? { mediaId: card.image, decorative: true } : null,
    seoTitle: s.title,
    seoDescription: `${s.summary} ${s.definition}`.slice(0, 300),
    detail: {
      definition: s.definition,
      coversTitle: 'What this covers',
      covers: s.covers,
      howTitle: 'How we work on this',
      howLead: 'The same five steps apply to every service, applied here to this work.',
      howWeWork: s.howWeWork,
      whoForTitle: 'Who it’s for',
      whoFor: s.whoFor,
      relatedTitle: 'Related services',
      related: s.related,
      ctaTitle: s.ctaTitle,
      ctaText: 'Tell us what you are working towards and we will advise on where to start.',
    },
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
