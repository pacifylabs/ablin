import Link from 'next/link';
import type { HeroData as BlockHeroData } from '@/cms/schema';
import { HERO_BACKGROUND } from './config';
import { HeroSignalBackground } from './HeroSignalBackground';
import styles from './HeroSignal.module.css';

// This component renders only the "home" hero variant — the "page" variant (an ordinary page's kicker/title/
// lead/illustration) is rendered by ui/PageHero instead. See cms/BlockRenderer.tsx.
type HeroData = Extract<BlockHeroData, { variant: 'home' }>;

/**
 * The approved "signal structure" hero: eyebrow, headline, lead, two calls to action, and the frameworks strip, over
 * the animated lattice background. All copy comes from content/home.json (hero), so it stays editable with the rest.
 *
 * The background is one isolated layer; set HERO_BACKGROUND.enabled to false in ./config.ts to drop it.
 */
export function HeroSignal({ hero }: { hero: HeroData }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {HERO_BACKGROUND.enabled ? <HeroSignalBackground /> : null}

      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 id="hero-title" className={styles.title}>
          {hero.title}
        </h1>
        <p className={styles.lead} data-hero="lead">
          {hero.lead}
        </p>
        <div className={styles.cta}>
          <Link href={hero.primary.href} className={`${styles.btn} ${styles.primary}`}>
            <span className={styles.dot} aria-hidden="true" />
            {hero.primary.label}
          </Link>
          <Link href={hero.secondary.href} className={`${styles.btn} ${styles.ghost}`}>
            {hero.secondary.label}
          </Link>
        </div>
      </div>

      <div className={`container ${styles.fwWrap}`}>
        <div className={styles.fw}>
          <p id="hero-fw-label" className={styles.fwLabel}>
            {hero.frameworksLabel}
          </p>
          <ul className={styles.fwList} aria-labelledby="hero-fw-label">
            {hero.frameworkNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
