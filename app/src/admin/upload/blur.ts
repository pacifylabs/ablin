import sharp from 'sharp';

/**
 * A tiny (≤16px-wide) base64 JPEG data URI for next/image's `blurDataURL` — ImageSlot (and content/schema.ts's
 * ImageAsset) require every image to carry one, so every upload gets one at upload time rather than on read.
 */
export async function generateBlurDataUrl(buffer: Buffer): Promise<string> {
  const tiny = await sharp(buffer)
    .resize(16, 16, { fit: 'inside' })
    .jpeg({ quality: 40 })
    .toBuffer();
  return `data:image/jpeg;base64,${tiny.toString('base64')}`;
}

export async function readImageDimensions(
  buffer: Buffer,
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error('Could not read image dimensions');
  return { width: metadata.width, height: metadata.height };
}
