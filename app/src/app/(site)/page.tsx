import type { Metadata } from 'next';
import { InsightsTeaser } from '@/components/home/InsightsTeaser';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getPageWithFallback } from '@/cms/store';
import { jsonLdScriptContent } from '@/lib/json-ld';
import { config } from '@/lib/config';
import { getHome, getImage, getInsightsPage } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback('home');
  return buildPageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: '/',
    absoluteTitle: true,
  });
}

const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: config.siteUrl,
  logo: `${config.siteUrl}/image/logo-lockup-light.png`,
  description: site.positioning,
  areaServed: 'GB',
};

export default async function HomePage() {
  const [page, home, insightsPage] = await Promise.all([
    getPageWithFallback('home'),
    getHome(),
    getInsightsPage(),
  ]);
  const insightsImage = await getImage(home.insights.image);

  // The Home page has one pinned, non-block section — the "no articles yet" Insights teaser (the closed block
  // palette has no block for it; see admin/README.md §Pinned sections). It always renders immediately before
  // the page's call-to-action band, matching where it sits in the page's seeded content (cms/seed-data.ts).
  const ctaIndex = page.blocks.findIndex((b) => b.type === 'ctaBand');
  const before = ctaIndex === -1 ? page.blocks : page.blocks.slice(0, ctaIndex);
  const after = ctaIndex === -1 ? [] : page.blocks.slice(ctaIndex);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: config.siteUrl,
    description: page.seoDescription,
    publisher: { '@type': 'Organization', name: site.name, url: config.siteUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(organisationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(websiteJsonLd) }}
      />
      <BlockRenderer blocks={before} />
      <InsightsTeaser data={home.insights} topics={insightsPage.topics} image={insightsImage} />
      <BlockRenderer blocks={after} />
    </>
  );
}
