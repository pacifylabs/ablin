import Link from 'next/link';
import { LineIcon } from '../LineIcon';
import type { BlockProps } from './types';
import styles from './CapabilityPanels.module.css';

/** DS v3 §7.4: three navy glass panels in one group, overlapping the hero when placed straight after it. */
export function CapabilityPanels({ block, ctx }: BlockProps<'capabilityPanels'>) {
  return (
    <section
      id={block.anchorId || undefined}
      className={`wrap ${styles.wrap}${ctx.overlapHero ? ` ${styles.overlap}` : ''}`}
      aria-label={block.data.panels.map((p) => p.title).join(', ')}
    >
      <ul className={`${styles.panels} on-navy`}>
        {block.data.panels.map((panel) => (
          <li key={panel.title} className={styles.panel}>
            <LineIcon name={panel.icon} size={30} className={styles.icon} />
            <h2 className={styles.title}>{panel.title}</h2>
            <p className={styles.text}>{panel.text}</p>
            <Link href={panel.link.href} className={styles.link}>
              {panel.link.label}
              <span className="sr-only">: {panel.title}</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
