import { cache } from 'react';
import { config } from '@/lib/config';
import { getSeoSettings, getSiteSettings } from './globals';

/**
 * The public origin for canonical URLs, Open Graph and the sitemap: the admin's `settings:site.siteUrl`, else
 * SITE_URL, else the hosting platform's production domain (lib/config.ts). On Vercel the last step is always set, so
 * production output never falls back to localhost.
 */
export const getSiteUrl = cache(async (): Promise<string> => {
  const { siteUrl } = await getSiteSettings();
  return siteUrl || config.siteUrl;
});

/** Absolute URL for a site-relative path or asset; absolute URLs pass through. */
export function absoluteUrl(base: string, pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : new URL(pathOrUrl, `${base}/`).toString();
}

/** schema.org Organization built from `settings:seo.organization`. */
export async function organizationJsonLd(): Promise<Record<string, unknown>> {
  const [{ organization }, base] = await Promise.all([getSeoSettings(), getSiteUrl()]);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    ...(organization.legalName ? { legalName: organization.legalName } : {}),
    url: base,
    ...(organization.logo ? { logo: absoluteUrl(base, organization.logo) } : {}),
    ...(organization.description ? { description: organization.description } : {}),
    ...(organization.email ? { email: organization.email } : {}),
    ...(organization.areaServed ? { areaServed: organization.areaServed } : {}),
    ...(organization.sameAs.length ? { sameAs: organization.sameAs } : {}),
  };
}

/** The site default share image from settings:seo, as an absolute URL, or null. */
export async function defaultShareImage(): Promise<{ url: string; alt: string } | null> {
  const [seo, base] = await Promise.all([getSeoSettings(), getSiteUrl()]);
  return seo.ogImage ? { url: absoluteUrl(base, seo.ogImage), alt: seo.ogImageAlt } : null;
}
