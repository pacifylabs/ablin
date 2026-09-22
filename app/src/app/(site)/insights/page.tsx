import type { Metadata } from 'next';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getPageWithFallback, listPublishedArticlesSafe } from '@/cms/store';
import blocks from '@/components/ui/blocks.module.css';
import { Button } from '@/components/ui/Button';
import { ArticleCard } from '@/components/insights/ArticleCard';
import { getInsightsPage } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback('insights');
  return buildPageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: '/insights',
  });
}

/**
 * The pinned section below (the closed block palette has no block for it; see admin/README.md §Pinned
 * sections) shows either the honest "no articles yet" topic-areas treatment (PRD §8.6) or, once the admin has
 * published at least one article, a real list of them — never sample or dated articles either way. It always
 * renders immediately before the page's call-to-action band.
 */
export default async function InsightsPage() {
  const [page, insightsPage, articles] = await Promise.all([
    getPageWithFallback('insights'),
    getInsightsPage(),
    listPublishedArticlesSafe(),
  ]);

  const ctaIndex = page.blocks.findIndex((b) => b.type === 'ctaBand');
  const before = ctaIndex === -1 ? page.blocks : page.blocks.slice(0, ctaIndex);
  const after = ctaIndex === -1 ? [] : page.blocks.slice(ctaIndex);

  return (
    <>
      <BlockRenderer blocks={before} />

      {articles.length > 0 ? (
        <section className="section section-surface" aria-label="Articles">
          <div className="container">
            <ul className="card-grid cols-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="section section-surface" aria-label="Insights topics">
          <div className="container">
            <div className="card-grid cols-2">
              <article className="card">
                <h2 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>
                  {insightsPage.emptyTitle}
                </h2>
                <p className="muted">{insightsPage.emptyBody}</p>
                <p className="card-foot">
                  <Button href="/contact" variant="ghost">
                    Suggest a topic
                  </Button>
                </p>
              </article>
              <article className="card">
                <h2 style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>
                  {insightsPage.topicsTitle}
                </h2>
                <p className="muted">{insightsPage.topicsLead}</p>
                <ul className={blocks.topicList}>
                  {insightsPage.topics.map((topic) => (
                    <li key={topic} className={blocks.topic}>
                      {topic}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>
      )}

      <BlockRenderer blocks={after} />
    </>
  );
}
