import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveImage } from '@/cms/collections/media';
import { getSeoSettings, getSiteSettings } from '@/cms/globals';
import { absoluteUrl, getSiteUrl } from '@/cms/site-meta';
import { getPublishedArticleCached } from '@/cms/public-reads';
import { BlockRenderer } from '@/components/public/BlockRenderer';
import { Photo } from '@/components/public/Photo';
import { jsonLdScriptContent } from '@/lib/json-ld';
import styles from './article.module.css';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = await getPublishedArticleCached((await params).slug);
  if (!article) return {};
  const [cover, siteUrl] = await Promise.all([resolveImage(article.coverImage), getSiteUrl()]);
  const images = cover ? [{ url: absoluteUrl(siteUrl, cover.src), alt: cover.alt }] : undefined;
  return {
    title: article.seoTitle,
    description: article.seoDescription,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: { type: 'article', publishedTime: article.publishedAt, images },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const article = await getPublishedArticleCached((await params).slug);
  if (!article) notFound();

  const [siteUrl, seo, site, cover] = await Promise.all([
    getSiteUrl(),
    getSeoSettings(),
    getSiteSettings(),
    resolveImage(article.coverImage),
  ]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    ...(cover ? { image: absoluteUrl(siteUrl, cover.src) } : {}),
    author: { '@type': 'Organization', name: seo.organization.name, url: siteUrl },
  };
  const date = new Intl.DateTimeFormat(site.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(jsonLd) }}
      />
      <header className={styles.header} data-bg="surface">
        <div className={`wrap ${styles.narrow}`}>
          {article.topics.length > 0 ? (
            <p className="eyebrow">{article.topics.join(' · ')}</p>
          ) : null}
          <h1>{article.title}</h1>
          <p className="lead">{article.excerpt}</p>
          {article.publishedAt ? (
            <time dateTime={article.publishedAt} className={styles.date}>
              {date.format(new Date(article.publishedAt))}
            </time>
          ) : null}
        </div>
      </header>
      {cover ? (
        <div className={`wrap ${styles.cover}`}>
          <div className={styles.coverFrame}>
            <Photo image={cover} fill priority sizes="(max-width: 1240px) 100vw, 1240px" />
          </div>
        </div>
      ) : null}
      <BlockRenderer blocks={article.blocks} ctx={{ pageTitle: article.title }} />
    </>
  );
}
