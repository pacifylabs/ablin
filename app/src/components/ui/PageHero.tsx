import type { IllustrationScene, ImageAsset } from '@/content/schema';
import { ImageSlot } from './ImageSlot';
import { Illustration } from './Illustration';
import styles from './PageHero.module.css';

interface PageHeroProps {
  title: string;
  lead: string;
  scene: IllustrationScene;
  /** When given, a duotone photograph replaces the illustration, with the illustration's plane peeking behind it. */
  image?: ImageAsset;
  /** Small wayfinding line above the title, e.g. the section name. */
  kicker?: string;
  children?: React.ReactNode;
}

/** Header for inner pages: text on the left, a diagrammatic illustration on the right. */
export function PageHero({ title, lead, scene, image, kicker, children }: PageHeroProps) {
  return (
    <section className={`${styles.hero} grain`} aria-labelledby="page-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          {kicker ? <p className="kicker">{kicker}</p> : null}
          <h1 id="page-title">{title}</h1>
          <p className="lead">{lead}</p>
          {children ? <div className={styles.actions}>{children}</div> : null}
        </div>
        {image ? (
          <div className={`${styles.photo} stack`}>
            <ImageSlot image={image} ratio="4 / 3" sizes="(min-width: 900px) 40vw, 90vw" priority />
          </div>
        ) : (
          <Illustration scene={scene} />
        )}
      </div>
    </section>
  );
}
