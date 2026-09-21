import type { Framework } from '@/content/schema';
import { ArchRule } from '@/components/motifs/ArchRule';
import { FrameworkBadge } from './FrameworkBadge';
import styles from './FrameworkBand.module.css';

interface FrameworkBandProps {
  id: string;
  title: string;
  lead: string;
  note: string;
  frameworks: readonly Framework[];
}

/**
 * "Frameworks we advise on" (Design System v2.1 §D). The honest alternative to a stat bar or logo wall: the
 * standards Ablin advises on and prepares organisations for. It never reads as certifications held or issued.
 * Custom badges stand in until the client supplies approved logos (see FrameworkBadge for the logo slot).
 */
export function FrameworkBand({ id, title, lead, note, frameworks }: FrameworkBandProps) {
  return (
    <section className={`${styles.band} grain`} aria-labelledby={id}>
      <div className="container">
        <ArchRule className={styles.rule} />
        <div className={styles.head}>
          <h2 id={id}>{title}</h2>
          <p className="lead">{lead}</p>
        </div>
        <ul className={styles.grid}>
          {frameworks.map((framework) => (
            <li key={framework.id} className={`card ${styles.item}`}>
              <FrameworkBadge framework={framework} />
              <span className={styles.name}>{framework.name}</span>
              <span className="muted small">{framework.scope}</span>
              <span className={styles.meta}>
                {framework.publisher}
                {framework.edition ? `, ${framework.edition}` : ''}
              </span>
              <ul className={`card-foot ${styles.sources}`}>
                {framework.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-quiet"
                    >
                      {source.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className={`small muted ${styles.note}`}>{note}</p>
      </div>
    </section>
  );
}
