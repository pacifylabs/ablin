import { site } from '@/lib/site';
import styles from './home.module.css';

export function TaglineStrip() {
  return (
    <div className={styles.strip}>
      <p className={`container ${styles.stripText}`}>{site.tagline}</p>
    </div>
  );
}
