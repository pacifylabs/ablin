import { put } from '@vercel/blob';
import { generateBlurDataUrl, readImageDimensions } from '@/admin/upload/blur';
import { uploadImage } from '@/admin/upload/cloudinary';
import { isSameOrigin, json } from '@/admin/http';
import { putMedia, type Media } from '@/cms/collections/media';
import { slugify } from '@/cms/collections/topics';

const MAX_BYTES = 4 * 1024 * 1024; // Vercel's serverless request body cap is 4.5MB; stay under it with headroom.

const ALLOWED_BLOB_MIME = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function isAllowedBlobFile(file: File): boolean {
  const mime = file.type.toLowerCase().split(';')[0]?.trim() ?? '';
  if (mime && ALLOWED_BLOB_MIME.has(mime)) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext === 'pdf' || ext === 'txt' || ext === 'doc' || ext === 'docx';
}

async function readFile(
  request: Request,
): Promise<{ file: File; form: FormData } | { error: Response }> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return { error: json({ error: 'invalid_form' }, 400) };
  }
  const file = form.get('file');
  if (!(file instanceof File)) return { error: json({ error: 'missing_file' }, 400) };
  if (file.size === 0) return { error: json({ error: 'empty_file' }, 400) };
  if (file.size > MAX_BYTES)
    return { error: json({ error: 'too_large', maxBytes: MAX_BYTES }, 413) };
  return { file, form };
}

/**
 * Images go to Cloudinary. The file's real content is what decides whether it's an image — sharp parsing it
 * successfully (readImageDimensions) is the validation, not the browser-supplied MIME type or extension, which
 * either one can lie about.
 */
export async function handleUploadImage(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  const read = await readFile(request);
  if ('error' in read) return read.error;

  const buffer = Buffer.from(await read.file.arrayBuffer());

  let width: number, height: number;
  try {
    ({ width, height } = await readImageDimensions(buffer));
  } catch {
    return json({ error: 'not_an_image' }, 422);
  }

  const blur = await generateBlurDataUrl(buffer);
  const result = await uploadImage(buffer, read.file.name);
  if (!result.ok) {
    if (result.reason === 'not_configured') {
      console.error(
        'Image upload failed: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must all be set.',
      );
      return json({ error: 'unavailable' }, 503);
    }
    return json({ error: 'upstream' }, 502);
  }

  // Every upload becomes a media-library entry, so it can be reused and its alt text edited in one place.
  const text = (name: string) => {
    const v = read.form.get(name);
    return typeof v === 'string' ? v.trim().slice(0, 500) : '';
  };
  const base = slugify(read.file.name.replace(/\.[a-z0-9]+$/i, '')) || 'image';
  const media: Media = {
    id: `${base.slice(0, 48)}-${crypto.randomUUID().slice(0, 8)}`,
    url: result.data.url,
    publicId: result.data.publicId,
    alt: text('alt'),
    credit: text('credit'),
    width,
    height,
    blur,
    createdAt: new Date().toISOString(),
  };
  await putMedia(media);

  return json({ mediaId: media.id, url: media.url, width, height, blur, alt: media.alt }, 200);
}

/** Everything that isn't an image goes to Vercel Blob and is linked to (a PDF in rich text, for example). */
export async function handleUploadFile(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: 'bad_origin' }, 403);

  const read = await readFile(request);
  if ('error' in read) return read.error;

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    console.error('File upload failed: BLOB_READ_WRITE_TOKEN must be set.');
    return json({ error: 'unavailable' }, 503);
  }

  if (!isAllowedBlobFile(read.file)) {
    return json({ error: 'unsupported_type' }, 422);
  }

  try {
    const blob = await put(read.file.name, read.file, { access: 'public', addRandomSuffix: true });
    return json(
      {
        url: blob.url,
        filename: read.file.name,
        contentType: blob.contentType,
        size: read.file.size,
      },
      200,
    );
  } catch (error) {
    console.error('File upload failed:', error);
    return json({ error: 'upstream' }, 502);
  }
}
