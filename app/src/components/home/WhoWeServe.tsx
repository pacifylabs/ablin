import Link from 'next/link';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { Audience, ImageAsset } from '@/content/schema';
import type { AudienceGridData } from '@/cms/schema';
import styles from './home.module.css';

// This component renders only the "teaser" audienceGrid variant (Home). The "rows" variant (the Who We Serve
// page itself) is rendered inline by cms/BlockRenderer.tsx.
type Section = Extract<AudienceGridData, { variant: 'teaser' }>;

/** Asymmetric: heading and a tall photograph on the left, the five groups as hairline rows on the right. */
export function WhoWeServe({
  data,
  audiences,
  image,
}: {
  data: Section;
  audiences: readonly Audience[];
  image: ImageAsset;
}) {
  return (
    <section className="section" aria-labelledby="serve-title">
      <div className={`container ${styles.serveGrid}`}>
        <div className={styles.serveIntro}>
          <p className="kicker">{data.kicker}</p>
          <h2 id="serve-title">{data.title}</h2>
          <p className="lead">{data.lead}</p>
          <div className={`${styles.servePhoto} stack`}>
            <ImageSlot
              image={image}
              ratio="4 / 5"
              sizes="(min-width: 900px) 30vw, 90vw"
              position="40% 50%"
            />
          </div>
        </div>
        <div className={styles.serveList}>
          <ul>
            {audiences.map((audience) => (
              <li key={audience.slug} className={styles.serveRow}>
                <h3>{audience.title}</h3>
                <p className="muted">{audience.summary}</p>
              </li>
            ))}
          </ul>
          <p className={styles.moreLink}>
            <Link href="/who-we-serve" className="link-quiet">
              See who we serve
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
