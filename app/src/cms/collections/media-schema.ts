import { z } from 'zod';
import { imageUrlSchema } from '../fields';
import seedMediaJson from './seed-media.json';

/**
 * Media library shapes, with no server imports, so block schemas and admin client code can use them. The Redis reads
 * and writes are in ./media.ts.
 */
export const MEDIA_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

export const mediaSchema = z.object({
  id: z.string().regex(MEDIA_ID),
  url: imageUrlSchema,
  /** Cloudinary public_id; empty for a bundled /image/… file not yet uploaded. */
  publicId: z.string(),
  alt: z.string().trim(),
  /** Source URL or attribution, e.g. the Unsplash photo page. */
  credit: z.string().trim(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blur: z.string().startsWith('data:image/').or(z.literal('')),
  createdAt: z.string(),
});
export type Media = z.infer<typeof mediaSchema>;

/** What an image field stores. `decorative` renders alt="" regardless of the library's alt text. */
export const mediaRefSchema = z.object({
  mediaId: z.string().regex(MEDIA_ID),
  decorative: z.boolean(),
});
export type MediaRef = z.infer<typeof mediaRefSchema>;

/** Bundled photos, used by the seed and as the fallback if a media doc is missing or Redis is down. */
export const SEED_MEDIA: readonly Media[] = z.array(mediaSchema).parse(
  seedMediaJson.map(({ file, ...m }) => ({
    ...m,
    url: file,
    publicId: '',
    createdAt: '2026-01-01T00:00:00.000Z',
  })),
);

export interface ResolvedImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  blur: string;
}
