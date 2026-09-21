import { ArchRule } from '@/components/motifs/ArchRule';
import { Contours } from '@/components/motifs/Contours';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { ImageAsset } from '@/content/schema';
import styles from './home.module.css';

/** Editorial moment: one large serif statement with an offset photograph. Text only carries a claim of approach, never proof. */
export function Statement({ text, image }: { text: string; image: ImageAsset }) {
  return (
    <section className={`section ${styles.statement}`} aria-label="Our view of governance">
      <div className={`motif-bg ${styles.statementMotif}`}>
        <Contours />
      </div>
      <div className={`container ${styles.statementGrid}`}>
        <div className={`${styles.statementText} m-reveal`}>
          <ArchRule className={styles.statementRule} />
          <p>{text}</p>
        </div>
        <div className={`${styles.statementPhoto} stack m-reveal`}>
          <ImageSlot
            image={image}
            ratio="4 / 3"
            sizes="(min-width: 900px) 38vw, 90vw"
            position="50% 60%"
          />
        </div>
      </div>
    </section>
  );
}
