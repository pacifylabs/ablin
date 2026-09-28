'use client';

import styles from './ServiceCarousel.module.css';

/**
 * Previous/next for a scroll-snap track (DS v3 §7.7). Scrolls by one card; instant under reduced motion. The track
 * itself stays keyboard-scrollable, so these are a convenience, not the only way through.
 */
export function CarouselNav({
  trackId,
  prevLabel,
  nextLabel,
}: {
  trackId: string;
  prevLabel: string;
  nextLabel: string;
}) {
  function scroll(direction: 1 | -1) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap || '24') || 24;
    const step = (card?.getBoundingClientRect().width ?? 300) + gap;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * step, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <div className={styles.nav}>
      <button
        type="button"
        className={styles.navBtn}
        aria-label={prevLabel}
        aria-controls={trackId}
        onClick={() => scroll(-1)}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M13 8H3M7 4L3 8l4 4" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.navBtn} ${styles.navNext}`}
        aria-label={nextLabel}
        aria-controls={trackId}
        onClick={() => scroll(1)}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  );
}
