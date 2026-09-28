import { cache } from 'react';
import { z } from 'zod';
import { readCached } from '../cached';
import { imageUrlSchema } from '../fields';
import { keys } from '../keys';
import { redis } from '../redis';
import seedMediaJson from './seed-media.json';

/**
 * The media library (DS v3 §9): one `media:{id}` document per image, indexed by `media:index` (a sorted set scored by
 * creation time). Image fields elsewhere store only a reference ({ mediaId, decorative }), so editing an image's alt
 * text or credit here updates every place it is used.
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
export const SEED_MEDIA: readonly Media[] = z
  .array(mediaSchema)
  .parse(
    seedMediaJson.map(({ file, ...m }) => ({
      ...m,
      url: file,
      publicId: '',
      createdAt: '2026-01-01T00:00:00.000Z',
    })),
  );
const SEED_BY_ID = new Map(SEED_MEDIA.map((m) => [m.id, m]));

export const getMedia = cache(async (id: string): Promise<Media | null> => {
  const seed = SEED_BY_ID.get(id) ?? null;
  return readCached<Media | null>(keys.media(id), mediaSchema.nullable(), seed);
});

export interface ResolvedImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  blur: string;
}

/** Resolve an image field for rendering. Null when the referenced media no longer exists. */
export async function resolveImage(
  ref: MediaRef | null | undefined,
): Promise<ResolvedImage | null> {
  if (!ref) return null;
  const media = await getMedia(ref.mediaId);
  if (!media) return null;
  return {
    src: media.url,
    width: media.width,
    height: media.height,
    alt: ref.decorative ? '' : media.alt,
    blur: media.blur,
  };
}

// --- admin (uncached) ----------------------------------------------------------------------------------------

export async function listMedia(): Promise<Media[]> {
  const ids = await redis().zrange<string[]>(keys.mediaIndex, 0, -1, { rev: true });
  if (ids.length === 0) return [];
  const docs = await redis().mget<unknown[]>(...ids.map((id) => keys.media(id)));
  return docs.flatMap((d) => {
    const parsed = mediaSchema.safeParse(d);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function readMedia(id: string): Promise<Media | null> {
  const raw = await redis().get(keys.media(id));
  return raw ? mediaSchema.parse(raw) : null;
}

export async function putMedia(media: Media): Promise<void> {
  const r = redis();
  await r.set(keys.media(media.id), media);
  await r.zadd(keys.mediaIndex, { score: Date.parse(media.createdAt), member: media.id });
}

export async function deleteMedia(id: string): Promise<void> {
  const r = redis();
  await r.del(keys.media(id));
  await r.zrem(keys.mediaIndex, id);
}
