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

/**
 * Home, About, Services, Who We Serve and Insights are now built from admin-edited blocks (see cms/schema.ts and
 * page:{slug} in Redis) rather than these JSON files, so most of what used to live here has moved. What's left
 * below is content the admin block editor deliberately does NOT cover — the closed palette has no block for it
 * — and so it stays static JSON, read the same way it always was (see admin/README.md §Pinned sections):
 *   - home.insights: the "no articles yet" teaser on the Home page.
 *   - about.mission / about.vision: the two fixed cards on the About page.
 *   - insightsPageSchema's topic/empty-state fields: the placeholder shown on /insights and reused by
 *     home.insights above, and servicesPageSchema/whoWeServePageSchema/legalPageSchema, which had nothing left
 *     to pin once their pages became fully block-driven, were removed outright rather than kept as dead code.
 */
export const homeSchema = z.object({
  insights: z.object({
    kicker: z.string(),
    title: z.string(),
    lead: z.string(),
    image: z.string(),
  }),
});

export const aboutSchema = z.object({
  mission: z.object({ title: z.string(), body: z.string() }),
  vision: z.object({ title: z.string(), body: z.string() }),
});

export const insightsPageSchema = z.object({
  topicsTitle: z.string(),
  topicsLead: z.string(),
  topics: z.array(z.string()).min(1),
  emptyTitle: z.string(),
  emptyBody: z.string(),
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
