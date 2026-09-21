import styles from './ArchRule.module.css';

/** Section divider: a hairline with a small arch at its centre, taken from the Ablin mark. Decorative. */
export function ArchRule({ className }: { className?: string }) {
  return (
    <div className={`${styles.rule}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <svg
        viewBox="0 0 40 20"
        width="40"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        <path d="M4 18A16 16 0 0 1 36 18" />
        <path d="M12 18A8 8 0 0 1 28 18" opacity="0.6" />
      </svg>
    </div>
  );
}
