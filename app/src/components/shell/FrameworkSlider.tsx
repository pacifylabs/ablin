import type { FrameworkWithMark } from '@/cms/collections/frameworks';
import { FrameworkMark } from '@/components/public/FrameworkMark';
import styles from './FrameworkSlider.module.css';

interface FrameworkSliderProps {
  items: readonly FrameworkWithMark[];
  title: string;
  note: string;
  ariaLabel: string;
}

/**
 * Autoplay strip of the frameworks Ablin advises on. It is pure CSS, so it ships no JavaScript.
 *
 * There is deliberately no visible pause button (client request). Motion stops on hover, when the strip has keyboard
 * focus (it is a focusable group so keyboard users can stop it), and permanently under prefers-reduced-motion.
 * WCAG 2.2.2 wants a way to pause moving content, so if strict AA conformance is required a visible control must
 * come back; see docs/ablin-design-system-v2.1.md §E.
 *
 * Each tile shows the framework's line icon, or its logo once the client has approved one (see FrameworkMark).
 */
export function FrameworkSlider({ items, title, note, ariaLabel }: FrameworkSliderProps) {
  return (
    <div className={styles.slider}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>
      <div
        className={styles.viewport}
        role="group"
        aria-label={ariaLabel}
        // Focusable so keyboard users can stop the motion by focusing it.
        tabIndex={0}
      >
        <div className={styles.track}>
          <ul className={styles.set}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.mark}>
                  <FrameworkMark framework={item} size={28} />
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.scope}>{item.descriptor}</span>
                </span>
              </li>
            ))}
          </ul>
          {/* Second copy makes the loop seamless; hidden from assistive technology and reduced-motion users. */}
          <ul className={`${styles.set} ${styles.clone}`} aria-hidden="true">
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.mark}>
                  <FrameworkMark framework={item} size={28} />
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.scope}>{item.descriptor}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
