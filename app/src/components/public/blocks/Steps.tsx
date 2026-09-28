import styles from './Steps.module.css';

/** Numbered steps (01–05…): a real sequence, so numbering is meaningful here (DS v3 §7.8). */
export function Steps({
  steps,
  compact = false,
}: {
  steps: readonly { title: string; text: string }[];
  compact?: boolean;
}) {
  return (
    <ol className={`${styles.steps}${compact ? ` ${styles.compact}` : ''}`}>
      {steps.map((step, i) => (
        <li key={`${i}-${step.title}`}>
          <span className={styles.num} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
