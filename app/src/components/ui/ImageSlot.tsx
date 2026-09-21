import Image from 'next/image';
import type { ImageAsset } from '@/content/schema';
import styles from './ImageSlot.module.css';

interface ImageSlotProps {
  image: ImageAsset;
  /** CSS aspect-ratio for the frame, e.g. "4 / 5". Defaults to the image's own ratio. */
  ratio?: string;
  /** `sizes` hint so next/image serves a right-sized file. */
  sizes: string;
  /** Focal point for cropping, e.g. "50% 30%". */
  position?: string;
  priority?: boolean;
  /** JPEG quality for the optimised file. Lower for large above-the-fold photographs on slow networks. */
  quality?: number;
  className?: string;
}

/**
 * The one way to place a photograph. Frame, duotone, blur placeholder, lazy loading and alt handling live here so
 * every image looks the same and swapping an asset is a change to content/images.json, not to a component.
 * Images marked `status: "placeholder"` are stand-ins pending client-supplied photography.
 */
export function ImageSlot({
  image,
  ratio,
  sizes,
  position = '50% 50%',
  priority = false,
  quality = 72,
  className,
}: ImageSlotProps) {
  return (
    <div
      className={`${styles.frame}${className ? ` ${className}` : ''}`}
      style={{ aspectRatio: ratio ?? `${image.width} / ${image.height}` }}
      data-placeholder={image.status === 'placeholder' ? 'true' : undefined}
    >
      <Image
        src={image.src}
        alt={image.decorative ? '' : image.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        fetchPriority={priority ? 'high' : undefined}
        placeholder="blur"
        blurDataURL={image.blur}
        className={styles.img}
        style={{ objectPosition: position }}
      />
    </div>
  );
}
