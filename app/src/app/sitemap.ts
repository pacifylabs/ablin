import type { MetadataRoute } from 'next';
import { listPublishedSlugs } from '@/cms/store';
import { config } from '@/lib/config';
import { getServices } from '@/lib/content';

const STATIC_PATHS = [
  '/',
  '/about',
  '/services',
  '/who-we-serve',
  '/insights',
  '/contact',
  '/privacy-policy',
  '/cookie-policy',
  '/terms-of-use',
  '/accessibility',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.siteUrl;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

  for (const service of await getServices()) {
    entries.push({
      url: `${base}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  try {
    for (const slug of await listPublishedSlugs(500)) {
      entries.push({
        url: `${base}/insights/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  } catch {
    // Redis unavailable at sitemap generation time — static and service URLs still ship.
  }

  return entries;
}
