import { FrameworkBadge } from '@/components/ui/FrameworkBadge';
import type { Framework } from '@/content/schema';
import styles from './FrameworkSlider.module.css';

interface FrameworkSliderProps {
  items: readonly Framework[];
}

/**
 * Autoplay strip of the frameworks Ablin advises on. It is pure CSS, so it ships no JavaScript.
 *
 * There is deliberately no visible pause button (client request). Motion stops on hover, when the strip has keyboard
 * focus (it is a focusable group so keyboard users can stop it), and permanently under prefers-reduced-motion.
 * WCAG 2.2.2 wants a way to pause moving content, so if strict AA conformance is required a visible control must
 * come back; see docs/ablin-design-system-v2.1.md §E.
 *
 * Each tile shows a custom glyph until an approved, licensed logo is set on the framework (see FrameworkBadge).
 */
export function FrameworkSlider({ items }: FrameworkSliderProps) {
  return (
    <div className={styles.slider}>
      <div className={styles.head}>
        <h2 className={styles.title}>Frameworks we advise on</h2>
        <p className={styles.note}>
          Advisory and readiness support only. We do not issue certificates.
        </p>
      </div>
      <div
        className={styles.viewport}
        role="group"
        aria-label="Frameworks list, scrolling. Hover or focus to pause."
        // Focusable so keyboard users can stop the motion by focusing it.
        tabIndex={0}
      >
        <div className={styles.track}>
          <ul className={styles.set}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <FrameworkBadge framework={item} size={44} tone="onDark" />
                <span className={styles.text}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.scope}>{item.scope}</span>
                </span>
              </li>
            ))}
          </ul>
          {/* Second copy makes the loop seamless; hidden from assistive technology and reduced-motion users. */}
          <ul className={`${styles.set} ${styles.clone}`} aria-hidden="true">
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <FrameworkBadge framework={item} size={44} tone="onDark" />
                <span className={styles.text}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.scope}>{item.scope}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
