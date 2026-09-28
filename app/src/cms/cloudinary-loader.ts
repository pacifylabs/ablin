import type { ImageLoaderProps } from 'next/image';

/**
 * next/image loader (DS v3 §5): Cloudinary URLs get `f_auto,q_auto,w_{width}` inserted after `/upload/`, so the
 * CDN picks the format and quality and resizes to what the layout asks for. Bundled /image/… files go through Next's
 * own optimiser unchanged.
 */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const marker = '/image/upload/';
  const at = src.indexOf(marker);
  if (!src.startsWith('https://res.cloudinary.com/') || at === -1) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
  }
  const head = src.slice(0, at + marker.length);
  const tail = src.slice(at + marker.length);
  return `${head}f_auto,q_${quality ?? 'auto'},w_${width},c_limit/${tail}`;
}
