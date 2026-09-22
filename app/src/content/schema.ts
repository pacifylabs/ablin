import { z } from 'zod';

/**
 * Content schemas. Every page's copy is data validated against these, so the source can move from
 * JSON files to a database and admin without touching a component (see lib/content.ts).
 */
export const illustrationScene = z.enum([
  'structure',
  'governance',
  'controls',
  'data',
  'iso',
  'ai',
  'cyber',
  'audit',
  'soc2',
]);
export type IllustrationScene = z.infer<typeof illustrationScene>;

const cta = z.object({ label: z.string().min(1), href: z.string().startsWith('/') });

export const step = z.object({ title: z.string().min(1), description: z.string().min(1) });
export const approachSchema = z.object({
  kicker: z.string(),
  title: z.string(),
  lead: z.string(),
  steps: z.array(step).length(5),
});

export const serviceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  summary: z.string(),
  definition: z.string(),
  covers: z.array(z.string()).min(4),
  /** One line per approach step, in order. */
  howWeWork: z.array(z.string()).length(5),
  whoFor: z.array(z.string()).min(1),
  related: z.array(z.string()).min(1),
  illustration: illustrationScene,
  ctaTitle: z.string(),
});
export type Service = z.infer<typeof serviceSchema>;

export const audienceSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  services: z.array(z.string()).min(1),
});
export type Audience = z.infer<typeof audienceSchema>;

/**
 * Optional licensed logo for a framework. It renders only when EVERY field is present: the client must have
 * approved it and hold the right to use it. Until then the custom badge is shown (see FrameworkBadge).
 */
export const frameworkLogoSchema = z.object({
  src: z.string().startsWith('/'),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  approvedBy: z.string().min(1),
  licenceRef: z.string().min(1),
});

export const frameworkSchema = z.object({
  id: z.enum(['iso-27001', 'iso-42001', 'uk-gdpr', 'soc-2', 'nist-ai-rmf']),
  name: z.string(),
  scope: z.string(),
  /** Who publishes or owns the framework. Named as a fact; never as an endorsement of Ablin. */
  publisher: z.string().min(1),
  /** Edition or year, where the framework has one. */
  edition: z.string().optional(),
  /** Authoritative pages for the framework: the reader can check it at the source. */
  sources: z
    .array(z.object({ label: z.string().min(1), url: z.string().url().startsWith('https://') }))
    .min(1),
  logo: frameworkLogoSchema.optional(),
});
export type Framework = z.infer<typeof frameworkSchema>;

export const imageSchema = z.object({
  src: z.string().startsWith('/'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Empty for decorative images, which are hidden from assistive technology. */
  alt: z.string(),
  decorative: z.boolean(),
  blur: z.string().startsWith('data:image/'),
  credit: z.object({ source: z.string(), url: z.string().url(), licence: z.string() }),
  /** `placeholder` = stock chosen for layout; swap for a client-supplied asset, then set to `approved`. */
  status: z.enum(['placeholder', 'approved']),
});
export type ImageAsset = z.infer<typeof imageSchema>;
export const imagesSchema = z.record(z.string(), imageSchema);

const ctaBlock = z.object({ title: z.string(), body: z.string(), primary: cta });

export const homeSchema = z.object({
  hero: z.object({
    title: z.string(),
    lead: z.string(),
    primary: cta,
    secondary: cta,
    /** Line above the headline. */
    eyebrow: z.string().min(1),
    /** Strip at the foot of the hero: names of frameworks Ablin advises on. Never certifications held. */
    frameworksLabel: z.string().min(1),
    frameworkNames: z.array(z.string().min(1)).min(1),
  }),
  statement: z.object({ text: z.string(), image: z.string() }),
  frameworks: z.object({ title: z.string(), lead: z.string(), note: z.string() }),
  capabilities: z.object({
    title: z.string(),
    lead: z.string(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          serviceSlug: z.string(),
          illustration: illustrationScene,
        }),
      )
      .length(3),
  }),
  services: z.object({ kicker: z.string(), title: z.string(), lead: z.string() }),
  audiences: z.object({
    kicker: z.string(),
    title: z.string(),
    lead: z.string(),
    image: z.string(),
  }),
  why: z.object({
    title: z.string(),
    lead: z.string(),
    illustration: illustrationScene,
    points: z.array(z.object({ title: z.string(), description: z.string() })).min(3),
  }),
  insights: z.object({
    kicker: z.string(),
    title: z.string(),
    lead: z.string(),
    image: z.string(),
  }),
  cta: ctaBlock.extend({ image: z.string() }),
});

export const aboutSchema = z.object({
  title: z.string(),
  lead: z.string(),
  illustration: illustrationScene,
  image: z.string().optional(),
  introTitle: z.string(),
  intro: z.array(z.string()).min(1),
  mission: z.object({ title: z.string(), body: z.string() }),
  vision: z.object({ title: z.string(), body: z.string() }),
  values: z.object({
    title: z.string(),
    lead: z.string(),
    items: z.array(z.object({ title: z.string(), description: z.string() })).length(5),
  }),
  cta: ctaBlock,
});

export const servicesPageSchema = z.object({
  title: z.string(),
  lead: z.string(),
  illustration: illustrationScene,
  image: z.string().optional(),
  catalogue: z.object({ title: z.string(), lead: z.string() }),
  cta: ctaBlock,
});

export const whoWeServePageSchema = z.object({
  title: z.string(),
  lead: z.string(),
  illustration: illustrationScene,
  image: z.string().optional(),
  groups: z.object({ title: z.string(), lead: z.string() }),
  cta: ctaBlock,
});

export const insightsPageSchema = z.object({
  title: z.string(),
  lead: z.string(),
  illustration: illustrationScene,
  image: z.string().optional(),
  topicsTitle: z.string(),
  topicsLead: z.string(),
  topics: z.array(z.string()).min(1),
  emptyTitle: z.string(),
  emptyBody: z.string(),
  cta: ctaBlock,
});

export const contactPageSchema = z.object({
  title: z.string(),
  lead: z.string(),
  enquiryTypes: z.array(z.object({ value: z.string(), label: z.string() })).min(2),
  next: z.object({
    title: z.string(),
    steps: z.array(z.object({ title: z.string(), description: z.string() })).length(3),
  }),
  privacyNote: z.string(),
});
export type EnquiryType = z.infer<typeof contactPageSchema>['enquiryTypes'][number];

export const legalPageSchema = z.object({
  slug: z.enum(['privacy-policy', 'cookie-policy', 'terms-of-use', 'accessibility']),
  title: z.string(),
  description: z.string(),
  lead: z.string(),
  /** Legal text stays flagged until the client has reviewed it (PRD §8.8). */
  reviewStatus: z.enum(['draft', 'approved']),
  updated: z.string(),
  sections: z.array(
    z.object({
      heading: z.string(),
      paragraphs: z.array(z.string()).default([]),
      list: z.array(z.string()).default([]),
    }),
  ),
});
export type LegalPage = z.infer<typeof legalPageSchema>;
