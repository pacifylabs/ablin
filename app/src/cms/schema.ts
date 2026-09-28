import { z } from 'zod';
import { blockSchema } from './blocks';
import { mediaRefSchema } from './collections/media';

/**
 * Page and article documents, availability, the admin user, sessions and submissions. The closed block palette lives
 * in cms/blocks (one schema per block); rich-text documents in cms/richdoc.ts.
 */

export { blockSchema, BLOCK_TYPES, PALETTE, type Block, type BlockType } from './blocks';
export { EMPTY_DOC, richDocSchema, type RichDoc, type RichNode } from './richdoc';

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
  'coming-soon',
  'under-construction',
] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

/** Legal and accessibility pages must not revert to bundled seed copy when Redis errors (see getPageWithFallback). */
export const LEGAL_PAGE_SLUGS = new Set<PageSlug>([
  'privacy-policy',
  'cookie-policy',
  'terms-of-use',
  'accessibility',
]);

const pageEditableFields = {
  title: z.string().min(1),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  /** Share image for this page; null = the site default in settings:seo. */
  ogImage: mediaRefSchema.nullable(),
  /** Keep the page out of search indexes (e.g. a legal page not yet reviewed). */
  noindex: z.boolean(),
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
  coverImage: mediaRefSchema.nullable(),
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

/** Copy shown on the availability gate for one mode (DS v3 §9). */
export const availabilityCopySchema = z.object({
  headline: z.string().trim().min(1),
  message: z.string().trim().min(1),
  contactLine: z.string().trim(),
});
export type AvailabilityCopy = z.infer<typeof availabilityCopySchema>;

export const availabilitySchema = z.object({
  mode: z.enum(['live', 'coming_soon', 'under_construction']),
  /** Legacy single message, from before per-mode copy existed; used only when the mode has no copy of its own. */
  message: z.string(),
  updatedAt: z.string(),
  comingSoon: availabilityCopySchema.optional(),
  underConstruction: availabilityCopySchema.optional(),
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
