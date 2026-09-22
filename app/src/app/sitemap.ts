import type { MetadataRoute } from 'next';
import { getLegalReviewStatus } from '@/cms/legal-review';
import { listPublishedSlugs } from '@/cms/store';
import { seedPage } from '@/cms/seed-data';
import type { PageSlug } from '@/cms/schema';
import { config } from '@/lib/config';
import { getInsightsPage, getServices } from '@/lib/content';

const CORE_PATHS = [
  '/',
  '/about',
  '/services',
  '/who-we-serve',
  '/insights',
  '/contact',
] as const;

const LEGAL_SLUGS = ['privacy-policy', 'cookie-policy', 'terms-of-use', 'accessibility'] as const;

async function legalPathIndexable(slug: (typeof LEGAL_SLUGS)[number]): Promise<boolean> {
  try {
    const { getPageWithFallback } = await import('@/cms/store');
    const page = await getPageWithFallback(slug as PageSlug);
    return getLegalReviewStatus(page.blocks) === 'approved';
  } catch {
    return getLegalReviewStatus(seedPage(slug as PageSlug).blocks) === 'approved';
  }
}

function entry(
  base: string,
  path: string,
  opts: { priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] },
  lastModified = new Date(),
): MetadataRoute.Sitemap[0] {
  return {
    url: path === '/' ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.siteUrl;
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of CORE_PATHS) {
    entries.push(
      entry(base, path, {
        priority: path === '/' ? 1 : 0.8,
        changeFrequency: path === '/' ? 'weekly' : 'monthly',
      }, now),
    );
  }

  for (const slug of LEGAL_SLUGS) {
    if (await legalPathIndexable(slug)) {
      entries.push(
        entry(base, `/${slug}`, { priority: 0.4, changeFrequency: 'yearly' }, now),
      );
    }
  }

  for (const service of await getServices()) {
    entries.push(
      entry(base, `/services/${service.slug}`, { priority: 0.7, changeFrequency: 'monthly' }, now),
    );
  }

  try {
    for (const slug of await listPublishedSlugs(500)) {
      entries.push(
        entry(base, `/insights/${slug}`, { priority: 0.6, changeFrequency: 'monthly' }, now),
      );
    }
  } catch {
    // Redis unavailable — core and service URLs still ship.
  }

  try {
    const insightsPage = await getInsightsPage();
    for (const topic of insightsPage.topics) {
      entries.push(
        entry(
          base,
          `/insights/topic/${encodeURIComponent(topic)}`,
          { priority: 0.45, changeFrequency: 'monthly' },
          now,
        ),
      );
    }
  } catch {
    // Pinned insights copy unavailable — skip topic URLs.
  }

  return entries;
}
