import { z } from 'zod';
import { isSafeBlockImageUrl, isSafeHref } from '@/lib/safe-href';

/**
 * Field primitives shared by every Redis document (globals, collections, blocks). Validating hrefs and image URLs
 * here means an unsafe value is rejected at the admin API boundary, never at render time.
 */

export const textSchema = z.string().trim().min(1, 'Required');
export const optionalTextSchema = z.string().trim();

export const hrefSchema = z
  .string()
  .trim()
  .min(1, 'Required')
  .refine(isSafeHref, 'Link must be https, mailto, site-relative (/…), or a fragment (#…)');

export const linkSchema = z.object({ label: textSchema, href: hrefSchema });
export type Link = z.infer<typeof linkSchema>;

/** A bundled asset under /image/… or a Cloudinary https URL. */
export const imageUrlSchema = z
  .string()
  .trim()
  .refine(isSafeBlockImageUrl, 'Must be a site-relative /image/… path or a Cloudinary https URL');

export const emailSchema = z.string().trim().pipe(z.email('Enter a valid email address'));
