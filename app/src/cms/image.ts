import type { ImageAsset } from '@/content/schema';
import { config } from '@/lib/config';
import type { BlockImage } from './schema';

/**
 * Adapts an admin-uploaded image to the shape ImageSlot (the site's one image component) needs. Distinct from
 * `content/schema.ts`'s ImageAsset only in that an upload carries no licence credit — a fixed, honest
 * "uploaded by the firm" credit stands in, since ImageSlot's type requires the field to exist.
 */
export function toImageAsset(image: BlockImage): ImageAsset {
  return {
    src: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt,
    decorative: image.alt.trim() === '',
    blur: image.blur,
    credit: { source: 'Ablin Limited', url: config.siteUrl, licence: 'All rights reserved' },
    status: 'approved',
  };
}
