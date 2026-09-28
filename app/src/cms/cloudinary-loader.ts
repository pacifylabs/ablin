import type { ImageLoaderProps } from 'next/image';

/**
 * next/image loader (DS v3 §5): Cloudinary URLs get `f_auto,q_auto,w_{width}` inserted after `/upload/`, so the
 * CDN picks the format and quality and resizes to what the layout asks for. With a custom loader Next's own optimiser
 * is off, so bundled /image/… files (logos, and photos before `pnpm seed` uploads them) are served as they are; the
 * `w` query only tells Next the loader honours the width.
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const marker = '/image/upload/';
  const at = src.indexOf(marker);
  if (!src.startsWith('https://res.cloudinary.com/') || at === -1) {
    return `${src}?w=${width}`;
  }
  const head = src.slice(0, at + marker.length);
  const tail = src.slice(at + marker.length);
  return `${head}f_auto,q_${quality ?? 'auto'},w_${width},c_limit/${tail}`;
}

export { cloudinaryLoader };
