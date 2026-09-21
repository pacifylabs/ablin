import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { ImageAsset } from '@/content/schema';
import styles from './shell.module.css';

interface CtaBandProps {
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Optional photograph. It rises above the band's top edge so the band is not a flat box. */
  image?: ImageAsset;
}

/** Recurring contact band above the footer; the label rotates by page context (PRD §7). */
export function CtaBand({ title, body, primary, secondary, image }: CtaBandProps) {
  return (
    <section
      className={`${styles.cta_band} grain${image ? ` ${styles.ctaWithImage}` : ''}`}
      aria-labelledby="cta-band-title"
    >
      <div className={`container ${styles.ctaInner}`}>
        <div className={styles.ctaCopy}>
          <div className={styles.ctaText}>
            <h2 id="cta-band-title">{title}</h2>
            <p className="lead">{body}</p>
          </div>
          <div className={styles.ctaActions}>
            <Button href={primary.href}>{primary.label}</Button>
            {secondary ? (
              <Button href={secondary.href} variant="ghost">
                {secondary.label}
              </Button>
            ) : null}
          </div>
        </div>
        {image ? (
          <div className={`${styles.ctaPhoto} stack`}>
            <ImageSlot
              image={image}
              ratio="16 / 11"
              sizes="(min-width: 900px) 40vw, 90vw"
              position="50% 30%"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
