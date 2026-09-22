import { z } from 'zod';
import { illustrationScene } from '@/content/schema';

/**
 * Everything the admin CMS reads and writes in Redis. This is a second, parallel content schema to
 * `content/schema.ts`: that file still validates the JSON "master data" (services, audiences, frameworks, the
 * five approach steps, the image manifest) which the admin does not edit (see admin/README.md). This file
 * validates the page/article documents the admin DOES edit, and the closed block palette they are built from.
 */

const cta = z.object({ label: z.string().min(1), href: z.string().min(1) });

/**
 * A Cloudinary (or, pre-upload, freshly-generated) image reference, carrying everything ImageSlot needs so the
 * frame never shifts on load. Distinct from `content/schema.ts`'s ImageAsset, which additionally carries a
 * licence credit for the stock-photo manifest — an admin-uploaded photo has no such credit.
 */
export const blockImageSchema = z.object({
  // An admin upload is an absolute Cloudinary URL; a seeded placeholder (see scripts/seed.ts) is one of the
  // site-relative stock photos already in public/image, carried over unchanged until someone uploads a real one.
  url: z
    .string()
    .refine(
      (v) => v.startsWith('/') || /^https:\/\//.test(v),
      'Must be a site-relative path or an https URL',
    ),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blur: z.string().startsWith('data:image/'),
});
export type BlockImage = z.infer<typeof blockImageSchema>;

// ---------------------------------------------------------------------------------------------------------------
// Tiptap document (used only by the textRich block). Kept intentionally small: the marks/nodes the editor may
// produce are exactly the ones richtext.tsx knows how to render, so a document can never describe markup outside
// the design system.
// ---------------------------------------------------------------------------------------------------------------

export interface RichNode {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
  content?: RichNode[];
}

const richNodeSchema: z.ZodType<RichNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z
      .array(z.object({ type: z.string(), attrs: z.record(z.string(), z.unknown()).optional() }))
      .optional(),
    text: z.string().optional(),
    content: z.array(richNodeSchema).optional(),
  }),
);

export const richDocSchema = z.object({ type: z.literal('doc'), content: z.array(richNodeSchema) });
export type RichDoc = z.infer<typeof richDocSchema>;

export const EMPTY_DOC: RichDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

// ---------------------------------------------------------------------------------------------------------------
// Blocks — the closed palette. Every `type` maps to exactly one existing public component (see BlockRenderer.tsx).
// ---------------------------------------------------------------------------------------------------------------

export const heroBlockData = z.discriminatedUnion('variant', [
  z.object({
    variant: z.literal('home'),
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    lead: z.string().min(1),
    primary: cta,
    secondary: cta,
    frameworksLabel: z.string().min(1),
    frameworkNames: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    variant: z.literal('page'),
    kicker: z.string().optional(),
    title: z.string().min(1),
    lead: z.string().min(1),
    illustration: illustrationScene,
    image: blockImageSchema.optional(),
  }),
]);

export const capabilityGridData = z.object({
  title: z.string().min(1),
  lead: z.string().min(1),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        serviceSlug: z.string().min(1),
        illustration: illustrationScene,
      }),
    )
    .min(1),
});

export const serviceListData = z.discriminatedUnion('variant', [
  z.object({
    variant: z.literal('overview'),
    kicker: z.string().optional(),
    title: z.string().min(1),
    lead: z.string().min(1),
    serviceSlugs: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    variant: z.literal('catalogue'),
    title: z.string().min(1),
    lead: z.string().min(1),
    serviceSlugs: z.array(z.string().min(1)).min(1),
  }),
]);

const step = z.object({ title: z.string().min(1), description: z.string().min(1) });
export const approachStepsData = z.object({
  kicker: z.string().min(1),
  title: z.string().min(1),
  lead: z.string().min(1),
  // Fixed at 5: the component renders a five-step sequence and numbers the steps 1–5 in the design.
  steps: z.array(step).length(5),
});

export const audienceGridData = z.discriminatedUnion('variant', [
  z.object({
    variant: z.literal('teaser'),
    kicker: z.string().min(1),
    title: z.string().min(1),
    lead: z.string().min(1),
    image: blockImageSchema,
    audienceSlugs: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    variant: z.literal('rows'),
    title: z.string().min(1),
    lead: z.string().min(1),
    audienceSlugs: z.array(z.string().min(1)).min(1),
  }),
]);

export const whyListData = z.discriminatedUnion('variant', [
  z.object({
    variant: z.literal('cards'),
    title: z.string().min(1),
    lead: z.string().min(1),
    illustration: illustrationScene,
    points: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(3),
  }),
  z.object({
    variant: z.literal('cells'),
    title: z.string().min(1),
    lead: z.string().min(1),
    items: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(3),
  }),
]);

export const frameworkIndexData = z.object({
  title: z.string().min(1),
  lead: z.string().min(1),
  note: z.string().min(1),
  /** Ids from content/frameworks.json (the master framework list stays JSON; see admin/README.md). Empty = all. */
  frameworkIds: z.array(z.string().min(1)),
});

export const textRichData = z.discriminatedUnion('variant', [
  z.object({ variant: z.literal('split'), heading: z.string().min(1), doc: richDocSchema }),
  z.object({
    variant: z.literal('document'),
    title: z.string().min(1),
    lead: z.string().min(1),
    updated: z.string().min(1),
    reviewStatus: z.enum(['draft', 'approved']),
    doc: richDocSchema,
  }),
]);

export const imageBlockData = blockImageSchema.extend({
  /** CSS aspect-ratio, e.g. "16 / 9". Defaults to the image's own ratio when omitted. */
  ratio: z.string().optional(),
});

export const ctaBandData = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  primary: cta,
  secondary: cta.optional(),
  image: blockImageSchema.optional(),
});

const blockBase = { id: z.string().min(1) };

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ ...blockBase, type: z.literal('hero'), data: heroBlockData }),
  z.object({ ...blockBase, type: z.literal('capabilityGrid'), data: capabilityGridData }),
  z.object({ ...blockBase, type: z.literal('serviceList'), data: serviceListData }),
  z.object({ ...blockBase, type: z.literal('approachSteps'), data: approachStepsData }),
  z.object({ ...blockBase, type: z.literal('audienceGrid'), data: audienceGridData }),
  z.object({ ...blockBase, type: z.literal('whyList'), data: whyListData }),
  z.object({ ...blockBase, type: z.literal('frameworkIndex'), data: frameworkIndexData }),
  z.object({ ...blockBase, type: z.literal('textRich'), data: textRichData }),
  z.object({ ...blockBase, type: z.literal('image'), data: imageBlockData }),
  z.object({ ...blockBase, type: z.literal('ctaBand'), data: ctaBandData }),
]);
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];

// Per-block `data` types, for the existing public components that now take this shape as their props instead of
// the old `z.infer<typeof homeSchema>[...]` (see admin/README.md — those fields moved out of content/schema.ts).
export type HeroData = z.infer<typeof heroBlockData>;
export type CapabilityGridData = z.infer<typeof capabilityGridData>;
export type ServiceListData = z.infer<typeof serviceListData>;
export type ApproachStepsData = z.infer<typeof approachStepsData>;
export type AudienceGridData = z.infer<typeof audienceGridData>;
export type WhyListData = z.infer<typeof whyListData>;
export type FrameworkIndexData = z.infer<typeof frameworkIndexData>;
export type TextRichData = z.infer<typeof textRichData>;
export type ImageBlockData = z.infer<typeof imageBlockData>;
export type CtaBandData = z.infer<typeof ctaBandData>;

export const BLOCK_TYPES: readonly BlockType[] = [
  'hero',
  'capabilityGrid',
  'serviceList',
  'approachSteps',
  'audienceGrid',
  'whyList',
  'frameworkIndex',
  'textRich',
  'image',
  'ctaBand',
];

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  capabilityGrid: 'Capability grid',
  serviceList: 'Service list',
  approachSteps: 'Approach steps',
  audienceGrid: 'Audience grid',
  whyList: 'Why list',
  frameworkIndex: 'Framework index',
  textRich: 'Rich text',
  image: 'Image',
  ctaBand: 'Call-to-action band',
};

// ---------------------------------------------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------------------------------------------

export const PAGE_SLUGS = [
  'home',
  'about',
  'services',
  'who-we-serve',
  'insights',
  'contact',
  'privacy-policy',
  'cookie-policy',
  'terms-of-use',
  'accessibility',
] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

const pageEditableFields = {
  title: z.string().min(1),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  ogImage: z.string(),
  blocks: z.array(blockSchema),
};

export const pageDocSchema = z.object({
  slug: z.string().min(1),
  ...pageEditableFields,
  status: z.enum(['draft', 'published']),
  updatedAt: z.string(),
  /** Unpublished edits to an already-published page. Absent when there are none. See admin/README.md §Drafting. */
  draft: z.object({ ...pageEditableFields, updatedAt: z.string() }).optional(),
});
export type PageDoc = z.infer<typeof pageDocSchema>;

const articleEditableFields = {
  title: z.string().min(1),
  excerpt: z.string().min(1),
  coverImage: blockImageSchema.optional(),
  topics: z.array(z.string().min(1)),
  blocks: z.array(blockSchema),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
};

export const articleDocSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  ...articleEditableFields,
  status: z.enum(['draft', 'published']),
  publishedAt: z.string().optional(),
  updatedAt: z.string(),
  draft: z.object({ ...articleEditableFields, updatedAt: z.string() }).optional(),
});
export type ArticleDoc = z.infer<typeof articleDocSchema>;

export const availabilitySchema = z.object({
  mode: z.enum(['live', 'coming_soon', 'under_construction']),
  message: z.string(),
  updatedAt: z.string(),
});
export type Availability = z.infer<typeof availabilitySchema>;

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string().min(1),
  updatedAt: z.string(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const sessionSchema = z.object({ adminId: z.string(), createdAt: z.string() });
export type Session = z.infer<typeof sessionSchema>;

export const resetTokenSchema = z.object({ adminId: z.string() });
export type ResetToken = z.infer<typeof resetTokenSchema>;

const submissionStatus = z.enum(['unread', 'read', 'archived']);
export const submissionSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  organisation: z.string(),
  enquiryType: z.string(),
  message: z.string(),
  consent: z.boolean(),
  sourcePath: z.string(),
  status: submissionStatus,
  createdAt: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;
export type SubmissionStatus = z.infer<typeof submissionStatus>;
