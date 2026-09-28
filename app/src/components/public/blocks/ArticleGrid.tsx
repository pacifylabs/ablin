import Link from 'next/link';
import { resolveImage } from '@/cms/collections/media';
import { getTopics, slugify } from '@/cms/collections/topics';
import { getSiteSettings } from '@/cms/globals';
import { listPublishedArticlesCached } from '@/cms/public-reads';
import { Heading } from '../Heading';
import { Photo } from '../Photo';
import { Section } from '../Section';
import { INSIGHTS_PATH } from './TopicList';
import type { BlockProps } from './types';
import styles from './ArticleGrid.module.css';

/**
 * DS v3 §7.11. `latest`: the newest N published articles, and nothing at all when there are none (never placeholder
 * articles on the live site). `all`: the Insights index, filtered by ?topic= when present, with an empty state.
 */
export async function ArticleGrid({ block, ctx }: BlockProps<'articleGrid'>) {
  const { data } = block;
  const [articles, topics, site] = await Promise.all([
    listPublishedArticlesCached(data.mode === 'latest' ? data.count : 100),
    getTopics(),
    getSiteSettings(),
  ]);
  const topic =
    data.mode === 'all' && ctx.topic ? topics.find((t) => t.slug === ctx.topic) : undefined;
  const shown = topic
    ? articles.filter((a) => a.topics.some((name) => slugify(name) === topic.slug))
    : articles;

  if (data.mode === 'latest' && shown.length === 0) return null;

  const cards = await Promise.all(
    shown.map(async (a) => ({ article: a, image: await resolveImage(a.coverImage) })),
  );
  const date = new Intl.DateTimeFormat(site.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const titleId = `${block.id}-title`;

  return (
    <Section
      anchorId={block.anchorId}
      background={block.background}
      labelledBy={data.title ? titleId : undefined}
      label={data.title ? undefined : data.readMoreLabel}
    >
      <div className="wrap">
        {data.title ? (
          <Heading
            id={titleId}
            eyebrow={data.eyebrow}
            title={data.title}
            lead={data.lead}
            className={styles.head}
          />
        ) : null}

        {topic ? (
          <p className={styles.filter} role="status">
            {data.filterLabel.replaceAll('{topic}', topic.name)}{' '}
            {data.clearFilterLabel ? (
              <Link href={INSIGHTS_PATH}>{data.clearFilterLabel}</Link>
            ) : null}
          </p>
        ) : null}

        {cards.length === 0 ? (
          <div className={styles.empty}>
            {data.emptyTitle ? <h3>{data.emptyTitle}</h3> : null}
            {data.emptyText ? <p>{data.emptyText}</p> : null}
          </div>
        ) : (
          <ul className={styles.grid}>
            {cards.map(({ article, image }) => (
              <li key={article.slug}>
                <article className={styles.card}>
                  <Link href={`${INSIGHTS_PATH}/${article.slug}`} className={styles.link}>
                    <span className={styles.media}>
                      {image ? (
                        <Photo
                          image={{ ...image, alt: '' }}
                          fill
                          sizes="(max-width: 1000px) 100vw, 400px"
                        />
                      ) : null}
                    </span>
                    {article.topics[0] ? (
                      <span className={styles.topic}>{article.topics[0]}</span>
                    ) : null}
                    <h3>{article.title}</h3>
                  </Link>
                  {article.publishedAt ? (
                    <time dateTime={article.publishedAt} className={styles.date}>
                      {date.format(new Date(article.publishedAt))}
                    </time>
                  ) : null}
                  <p className={styles.excerpt}>{article.excerpt}</p>
                  <Link
                    href={`${INSIGHTS_PATH}/${article.slug}`}
                    className={styles.more}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    {data.readMoreLabel}
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
