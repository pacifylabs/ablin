import Image from 'next/image';
import type { ResolvedImage } from '@/cms/collections/media-schema';

interface PhotoProps {
  image: ResolvedImage;
  /** Fill the positioned parent (cover), or render at the image's own ratio. */
  fill?: boolean;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Every content photo: Cloudinary delivery (f_auto,q_auto,width), blur placeholder, admin-managed alt. */
export function Photo({ image, fill = false, sizes, priority = false, className }: PhotoProps) {
  const common = {
    src: image.src,
    sizes,
    priority,
    className,
    ...(image.blur ? { placeholder: 'blur' as const, blurDataURL: image.blur } : {}),
  };
  return fill ? (
    <Image {...common} alt={image.alt} fill style={{ objectFit: 'cover' }} />
  ) : (
    <Image {...common} alt={image.alt} width={image.width} height={image.height} />
  );
}
