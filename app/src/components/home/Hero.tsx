import { ArcLattice } from '@/components/motifs/ArcLattice';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { z } from 'zod';
import type { ImageAsset, homeSchema } from '@/content/schema';
import styles from './home.module.css';

type HeroData = z.infer<typeof homeSchema>['hero'];

const stagger = (index: number) => ({ '--i': index }) as React.CSSProperties;

/**
 * Layered hero: text on the left; on the right a duotone photograph with arch-lattice arcs emerging from behind it
 * and a flat tonal panel offset beneath. The photograph overlaps the tagline strip below, so the hero has no hard
 * bottom edge. Arcs draw on at load and drift slightly on scroll, only when motion is allowed.
 */
export function Hero({ hero, image }: { hero: HeroData; image: ImageAsset }) {
  return (
    <section className={`${styles.hero} grain`} aria-labelledby="hero-title">
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroText}>
          <h1 id="hero-title" className={styles.reveal} style={stagger(0)}>
            {hero.title}
          </h1>
          <p className={`lead ${styles.reveal}`} style={stagger(1)}>
            {hero.lead}
          </p>
          <div className={`${styles.heroActions} ${styles.reveal}`} style={stagger(2)}>
            <Button href={hero.primary.href}>{hero.primary.label}</Button>
            <Button href={hero.secondary.href} variant="ghost">
              {hero.secondary.label}
            </Button>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div
            className={`${styles.arcs} m-parallax`}
            style={{ '--drift': '-64px' } as React.CSSProperties}
          >
            <ArcLattice className="m-sweep" />
          </div>
          <div className={`${styles.photo} stack`}>
            <ImageSlot
              image={image}
              ratio="4 / 5"
              sizes="(min-width: 900px) 40vw, 90vw"
              position="50% 40%"
              priority
              quality={60}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
