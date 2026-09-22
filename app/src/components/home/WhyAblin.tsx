import { Illustration } from '@/components/ui/Illustration';
import type { WhyListData } from '@/cms/schema';
import styles from './home.module.css';

// This component renders only the "cards" whyList variant (Home). The "cells" variant (About's values grid)
// is rendered inline by cms/BlockRenderer.tsx.
type Why = Extract<WhyListData, { variant: 'cards' }>;

export function WhyAblin({ data }: { data: Why }) {
  return (
    <section className="section section-surface" aria-labelledby="why-title">
      <div className={`container ${styles.whyGrid}`}>
        <div className={styles.whyIntro}>
          <h2 id="why-title">{data.title}</h2>
          <p className="lead">{data.lead}</p>
          <div className={styles.whyIllustration}>
            <Illustration scene={data.illustration} />
          </div>
        </div>
        <div className={styles.whyList}>
          <ul>
            {data.points.map((point) => (
              <li key={point.title} className={styles.whyRow}>
                <article>
                  <h3>{point.title}</h3>
                  <p className="muted">{point.description}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
