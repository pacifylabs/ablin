import Link from 'next/link';
import { ArcLattice } from '@/components/motifs/ArcLattice';
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
 * Background mode is set in ./config.ts (`HERO_BACKGROUND.mode`).
 */
export function HeroSignal({ hero }: { hero: HeroData }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {HERO_BACKGROUND.mode === 'signal' ? <HeroSignalBackground /> : null}
      {HERO_BACKGROUND.mode === 'static' ? (
        <div className={`${styles.backdrop} grain`} aria-hidden="true">
          <ArcLattice className={styles.motif} withPath={false} />
        </div>
      ) : null}

      <div className={`container ${styles.grid}`}>
        <div className={styles.inner}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 id="hero-title" className={styles.title}>
          {hero.title}
        </h1>
        <p className={styles.lead} data-hero="lead">
          {hero.lead}
        </p>
        <div className={styles.cta}>
          <Link href={hero.primary.href} className={`btn btn-primary ${styles.btnPrimary}`}>
            {hero.primary.label}
          </Link>
          <Link href={hero.secondary.href} className={`btn btn-ghost ${styles.btnGhost}`}>
            {hero.secondary.label}
          </Link>
        </div>
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
