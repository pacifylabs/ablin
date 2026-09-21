import Link from 'next/link';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { z } from 'zod';
import type { ImageAsset, homeSchema } from '@/content/schema';
import styles from './home.module.css';

type Section = z.infer<typeof homeSchema>['insights'];

/**
 * No articles exist yet, and none are invented. Until the publishing pipeline ships this shows the topic
 * areas Insights will cover (PRD §8.6), beside a photograph. Replace with real article cards once published.
 */
export function InsightsTeaser({
  data,
  topics,
  image,
}: {
  data: Section;
  topics: readonly string[];
  image: ImageAsset;
}) {
  return (
    <section className="section" aria-labelledby="insights-title">
      <div className={`container ${styles.insightsGrid}`}>
        <div className={styles.insightsText}>
          <p className="kicker">{data.kicker}</p>
          <h2 id="insights-title">{data.title}</h2>
          <p className="lead">{data.lead}</p>
          <ul className={styles.tags} aria-label="Insights topics">
            {topics.map((topic) => (
              <li key={topic} className={styles.tag}>
                {topic}
              </li>
            ))}
          </ul>
          <p>
            <Link href="/insights" className="link-quiet">
              Visit Insights
            </Link>
          </p>
        </div>
        <div className={`${styles.insightsPhoto} stack`}>
          <ImageSlot
            image={image}
            ratio="4 / 3"
            sizes="(min-width: 900px) 45vw, 90vw"
            position="50% 50%"
          />
        </div>
      </div>
    </section>
  );
}
