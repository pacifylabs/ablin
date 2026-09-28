import type { Background } from '@/cms/blocks';
import styles from './Section.module.css';

interface SectionProps {
  anchorId: string;
  background: Background;
  labelledBy?: string;
  label?: string;
  /** `default` = DS v3 section padding; `tight` = half; `none` = the block handles its own spacing. */
  pad?: 'default' | 'tight' | 'none';
  /** Remove top padding when this section continues the previous one (same background). */
  flushTop?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * The one wrapper every block renders inside: anchor id, background (bg | surface | band) and section padding. On
 * `band` the text tokens are re-pointed at the band colours, so blocks need no band-specific CSS.
 */
export function Section({
  anchorId,
  background,
  labelledBy,
  label,
  pad = 'default',
  flushTop = false,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={anchorId || undefined}
      data-bg={background}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={[styles.section, styles[pad], flushTop ? styles.flushTop : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}
