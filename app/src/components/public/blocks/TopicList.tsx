import Link from 'next/link';
import { getTopics } from '@/cms/collections/topics';
import { Heading } from '../Heading';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './TopicList.module.css';

export const INSIGHTS_PATH = '/insights';

export function topicHref(slug: string): string {
  return `${INSIGHTS_PATH}/topic/${encodeURIComponent(slug)}`;
}

/** DS v3 §7.11: heading left, topic chips right. A chip opens the Insights index filtered to that topic. */
export async function TopicList({ block, ctx }: BlockProps<'topicList'>) {
  const { data } = block;
  const all = await getTopics();
  const topics =
    data.topicSlugs.length === 0
      ? all
      : data.topicSlugs.flatMap((slug) => all.filter((t) => t.slug === slug));
  const titleId = `${block.id}-title`;
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className={`wrap ${styles.split}`}>
        <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} lead={data.lead} />
        <ul className={styles.chips}>
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={topicHref(topic.slug)}
                className={styles.chip}
                aria-current={ctx.topic === topic.slug ? 'true' : undefined}
              >
                {topic.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
