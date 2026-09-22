import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getPublishedArticle } from '@/cms/store';
import { toImageAsset } from '@/cms/image';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { jsonLdScriptContent } from '@/lib/json-ld';
import { config } from '@/lib/config';
import { site } from '@/lib/site';

// Reads the article from Redis, so this must render per-request, not once at build time (see (site)/page.tsx
// for the same reasoning on the other Redis-backed routes).
export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = await getPublishedArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.seoTitle,
    description: article.seoDescription,
    alternates: { canonical: `/insights/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const article = await getPublishedArticle((await params).slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: site.name, url: config.siteUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(jsonLd) }}
      />
      <section className="section" aria-labelledby="page-title">
        <div
          className="container container-narrow"
          style={{ display: 'grid', gap: 'var(--space-6)' }}
        >
          {article.topics.length > 0 ? (
            <p className="kicker">{article.topics.join(' · ')}</p>
          ) : null}
          <h1 id="page-title">{article.title}</h1>
          <p className="lead">{article.excerpt}</p>
          {article.publishedAt ? (
            <p className="small muted">
              Published{' '}
              {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          ) : null}
          {article.coverImage ? (
            <div className="stack">
              <ImageSlot
                image={toImageAsset(article.coverImage)}
                ratio="16 / 9"
                sizes="(min-width: 900px) 60vw, 100vw"
                priority
              />
            </div>
          ) : null}
        </div>
      </section>

      <BlockRenderer blocks={article.blocks} />
    </>
  );
}
