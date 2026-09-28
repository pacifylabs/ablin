import styles from './shell.module.css';

export function SkipLink({ label }: { label: string }) {
  return (
    <a href="#main" className={styles.skip}>
      {label}
    </a>
  );
}
