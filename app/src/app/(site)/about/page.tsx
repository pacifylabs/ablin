import type { Metadata } from 'next';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getPageWithFallback } from '@/cms/store';
import { jsonLdScriptContent } from '@/lib/json-ld';
import { config } from '@/lib/config';
import { getAbout } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback('about');
  return buildPageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: '/about',
  });
}

export default async function AboutPage() {
  const [page, about] = await Promise.all([getPageWithFallback('about'), getAbout()]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: config.siteUrl,
    logo: `${config.siteUrl}/image/logo-lockup-light.png`,
    description: page.seoDescription,
    areaServed: 'GB',
  };

  // The Mission/Vision cards are pinned (the closed block palette has no block for a fixed two-card pair; see
  // admin/README.md §Pinned sections). They always render immediately after the page's first rich-text block —
  // the "Who we are" introduction — matching where they sit in the page's seeded content (cms/seed-data.ts).
  const introIndex = page.blocks.findIndex((b) => b.type === 'textRich');
  const before = introIndex === -1 ? page.blocks : page.blocks.slice(0, introIndex + 1);
  const after = introIndex === -1 ? [] : page.blocks.slice(introIndex + 1);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(jsonLd) }}
      />
      <BlockRenderer blocks={before} />

      <section className="section section-surface" aria-label="Mission and vision">
        <div className="container">
          <ul className="card-grid cols-2">
            {[about.mission, about.vision].map((item) => (
              <li key={item.title}>
                <article className="card">
                  <h2 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>{item.title}</h2>
                  <p className="lead" style={{ color: 'var(--text)' }}>
                    {item.body}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BlockRenderer blocks={after} />
    </>
  );
}
