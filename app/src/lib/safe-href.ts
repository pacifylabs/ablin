/**
 * Href allow-list shared by rich text, CMS CTAs and image URLs. Rejects protocol-relative URLs (//…) and
 * javascript: schemes that JSON.stringify alone would not catch in other contexts.
 */
export function isSafeHref(href: string): boolean {
  if (href.startsWith('//')) return false;
  return (
    /^https:\/\//.test(href) ||
    /^mailto:/.test(href) ||
    (href.startsWith('/') && !href.startsWith('//')) ||
    href.startsWith('#')
  );
}

/** Admin-uploaded images: bundled stock under /image/… or Cloudinary (matches next.config remotePatterns). */
export function isSafeBlockImageUrl(url: string): boolean {
  if (url.startsWith('//')) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  return /^https:\/\/res\.cloudinary\.com\//.test(url);
}
