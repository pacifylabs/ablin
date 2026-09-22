import type { IllustrationScene, ImageAsset } from '@/content/schema';
import { Contours } from '@/components/motifs/Contours';
import { ImageSlot } from './ImageSlot';
import { Illustration } from './Illustration';
import styles from './PageHero.module.css';

interface PageHeroProps {
  title: string;
  lead: string;
  scene: IllustrationScene;
  /** Duotone photograph; the illustration stays visible as a small offset layer behind it. */
  image?: ImageAsset;
  /** Small wayfinding line above the title, e.g. the section name. */
  kicker?: string;
  children?: React.ReactNode;
}

/** Inner-page hero: editorial type left, duotone photograph (when provided) with diagram accent. */
export function PageHero({ title, lead, scene, image, kicker, children }: PageHeroProps) {
  const hasPhoto = Boolean(image);

  return (
    <section className={`${styles.hero} grain`} aria-labelledby="page-title">
      <div className={`motif-bg ${styles.motif}`} aria-hidden="true">
        <Contours />
      </div>
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          {kicker ? <p className="kicker">{kicker}</p> : null}
          <h1 id="page-title">{title}</h1>
          <p className="lead">{lead}</p>
          {children ? <div className={styles.actions}>{children}</div> : null}
        </div>
        <div className={`${styles.media}${hasPhoto ? '' : ` ${styles.mediaIllustrationOnly}`}`}>
          <div className={styles.mediaDiagram} aria-hidden="true">
            <Illustration scene={scene} />
          </div>
          {image ? (
            <div className={`${styles.photo} stack`}>
              <ImageSlot
                image={image}
                ratio="4 / 3"
                sizes="(min-width: 900px) 28vw, 88vw"
                position="50% 42%"
                priority
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
