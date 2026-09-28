import Link from 'next/link';
import { resolveImage } from '@/cms/collections/media';
import { HeroSignalBackground } from '@/components/hero-signal/HeroSignalBackground';
import { Photo } from '../Photo';
import type { BlockProps } from './types';
import styles from './HeroFramed.module.css';

/**
 * DS v3 §7.3: rounded frame inset by the gutter. Layers bottom-up: photo → lattice (screen blend) → navy shade →
 * copy. The hero is navy in both themes. One load animation on the copy (motion.css `.rise`); nothing else moves.
 */
export async function HeroFramed({ block }: BlockProps<'heroFramed'>) {
  const { data } = block;
  const image = await resolveImage(data.image);
  const titleId = `${block.id}-title`;

  return (
    <section
      id={block.anchorId || undefined}
      className={`wrap ${styles.hero}`}
      aria-labelledby={titleId}
    >
      <div className={`${styles.frame} on-navy`}>
        {image ? (
          <Photo
            image={{ ...image, alt: '' }}
            fill
            priority
            sizes="(max-width: 1240px) 100vw, 1240px"
          />
        ) : null}
        {data.lattice ? <HeroSignalBackground /> : null}
        <div className={styles.shade} aria-hidden="true" />
        {data.locationTag ? (
          <span className={styles.tag} aria-hidden="true">
            {data.locationTag}
          </span>
        ) : null}
        <div className={styles.copy}>
          {data.eyebrow ? <p className={`${styles.eyebrow} rise`}>{data.eyebrow}</p> : null}
          <h1 id={titleId} className={`${styles.title} rise rise-1`}>
            {data.title}
          </h1>
          {data.lead ? <p className={`${styles.lead} rise rise-2`}>{data.lead}</p> : null}
          <div className={`${styles.ctas} rise rise-3`}>
            <Link href={data.primaryCta.href} className="btn btn-white">
              {data.primaryCta.label}
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            {data.secondaryCta ? (
              <Link href={data.secondaryCta.href} className="btn btn-ghost-white">
                {data.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
