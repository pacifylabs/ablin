import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/insights/ArticleCard';
import { getPageWithFallback, listPublishedArticlesSafe } from '@/cms/store';
import { getInsightsPage } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type Params = Promise<{ topic: string }>;

async function resolveTopic(encoded: string): Promise<string | null> {
  const decoded = decodeURIComponent(encoded);
  const insightsPage = await getInsightsPage();
  return insightsPage.topics.find((t) => t.toLowerCase() === decoded.toLowerCase()) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const topic = await resolveTopic((await params).topic);
  if (!topic) return {};
  const insightsPage = await getPageWithFallback('insights');
  return buildPageMetadata({
    title: `${topic} — Insights`,
    description: insightsPage.seoDescription,
    path: `/insights/topic/${encodeURIComponent(topic)}`,
  });
}

export default async function TopicPage({ params }: { params: Params }) {
  const topic = await resolveTopic((await params).topic);
  if (!topic) notFound();

  const articles = (await listPublishedArticlesSafe()).filter((a) =>
    a.topics.some((t) => t.toLowerCase() === topic.toLowerCase()),
  );

  return (
    <section className="section" aria-labelledby="page-title">
      <div className="container" style={{ display: 'grid', gap: 'var(--space-8)' }}>
        <header style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <p className="kicker">Insights</p>
          <h1 id="page-title">{topic}</h1>
        </header>
        {articles.length > 0 ? (
          <ul className="card-grid cols-3">
            {articles.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No articles are published under this topic yet.</p>
        )}
      </div>
    </section>
  );
}
