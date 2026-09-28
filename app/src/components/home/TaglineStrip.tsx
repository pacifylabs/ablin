import styles from './home.module.css';

export function TaglineStrip({ tagline }: { tagline: string }) {
  return (
    <div className={styles.strip}>
      <p className={`container ${styles.stripText}`}>{tagline}</p>
    </div>
  );
}
