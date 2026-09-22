import { createHash } from 'node:crypto';

export interface CloudinaryUploadResult {
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export type CloudinaryResult =
  { ok: true; data: CloudinaryUploadResult } | { ok: false; reason: 'not_configured' | 'upstream' };

/**
 * Signs and performs the upload server-side (build brief: "Images: Cloudinary (signed server-side upload)") —
 * the API secret never reaches the browser, and the admin's own fetch only ever talks to this Next.js route,
 * never to Cloudinary directly. No SDK: a plain fetch, matching how the rest of the project calls out to
 * third-party HTTP APIs (see lib/contact-delivery.ts, admin/auth/reset-email.ts).
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  deps: { fetchImpl?: typeof fetch } = {},
): Promise<CloudinaryResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) return { ok: false, reason: 'not_configured' };

  const fetchImpl = deps.fetchImpl ?? fetch;
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'ablin-admin';
  // Cloudinary's signature: every param that will be sent (other than file/api_key/signature), sorted and
  // joined, with the API secret appended, then SHA-1 hashed. https://cloudinary.com/documentation/signatures
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');

  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(buffer)]), filename);
  form.set('api_key', apiKey);
  form.set('timestamp', String(timestamp));
  form.set('folder', folder);
  form.set('signature', signature);

  try {
    const response = await fetchImpl(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    if (!response.ok) return { ok: false, reason: 'upstream' };
    const body = (await response.json()) as {
      secure_url: string;
      width: number;
      height: number;
      bytes: number;
      format: string;
    };
    return {
      ok: true,
      data: {
        url: body.secure_url,
        width: body.width,
        height: body.height,
        bytes: body.bytes,
        format: body.format,
      },
    };
  } catch {
    return { ok: false, reason: 'upstream' };
  }
}
