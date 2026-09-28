import type { Metadata } from 'next';
import { InsightsTeaser } from '@/components/home/InsightsTeaser';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getPageWithFallback } from '@/cms/store';
import { jsonLdScriptContent } from '@/lib/json-ld';
import { getHome, getImage, getInsightsPage } from '@/lib/content';
import { organizationJsonLd } from '@/cms/site-meta';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback('home');
  return {
    title: { absolute: page.seoTitle },
    description: page.seoDescription,
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const [page, home, insightsPage] = await Promise.all([
    getPageWithFallback('home'),
    getHome(),
    getInsightsPage(),
  ]);
  const [insightsImage, organisationJsonLd] = await Promise.all([
    getImage(home.insights.image),
    organizationJsonLd(),
  ]);

  // The Home page has one pinned, non-block section — the "no articles yet" Insights teaser (the closed block
  // palette has no block for it; see admin/README.md §Pinned sections). It always renders immediately before
  // the page's call-to-action band, matching where it sits in the page's seeded content (cms/seed-data.ts).
  const ctaIndex = page.blocks.findIndex((b) => b.type === 'ctaBand');
  const before = ctaIndex === -1 ? page.blocks : page.blocks.slice(0, ctaIndex);
  const after = ctaIndex === -1 ? [] : page.blocks.slice(ctaIndex);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(organisationJsonLd) }}
      />
      <BlockRenderer blocks={before} />
      <InsightsTeaser data={home.insights} topics={insightsPage.topics} image={insightsImage} />
      <BlockRenderer blocks={after} />
    </>
  );
}
