import type { MetadataRoute } from 'next';
import { listServices, serviceHref } from '@/cms/collections/services';
import { getTopics } from '@/cms/collections/topics';
import { getPublicPage } from '@/cms/public-reads';
import type { PageSlug } from '@/cms/schema';
import { getSiteUrl } from '@/cms/site-meta';
import { listPublishedSlugs } from '@/cms/store';

const CORE_PATHS = ['/', '/about', '/services', '/who-we-serve', '/insights', '/contact'] as const;
const LEGAL_SLUGS = ['privacy-policy', 'cookie-policy', 'terms-of-use', 'accessibility'] as const;

type Entry = MetadataRoute.Sitemap[number];

function entry(
  base: string,
  path: string,
  priority: number,
  changeFrequency: Entry['changeFrequency'],
  lastModified: Date,
): Entry {
  return {
    url: path === '/' ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

/** A legal page is listed only once its text is approved (the page is no longer noindex). */
async function legalIndexable(slug: PageSlug): Promise<boolean> {
  try {
    return !(await getPublicPage(slug)).noindex;
  } catch {
    return false;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = CORE_PATHS.map((path) =>
    entry(base, path, path === '/' ? 1 : 0.8, path === '/' ? 'weekly' : 'monthly', now),
  );

  for (const slug of LEGAL_SLUGS) {
    if (await legalIndexable(slug)) entries.push(entry(base, `/${slug}`, 0.4, 'yearly', now));
  }

  for (const service of await listServices()) {
    entries.push(entry(base, serviceHref(service.slug), 0.7, 'monthly', now));
  }

  try {
    for (const slug of await listPublishedSlugs(500)) {
      entries.push(entry(base, `/insights/${slug}`, 0.6, 'monthly', now));
    }
  } catch {
    // Redis unavailable — core and service URLs still ship.
  }

  for (const topic of await getTopics()) {
    entries.push(entry(base, `/insights/topic/${topic.slug}`, 0.45, 'monthly', now));
  }

  return entries;
}
