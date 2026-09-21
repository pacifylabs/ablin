'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/Icon';
import { THEME_STORAGE_KEY } from '@/lib/theme';
import styles from './shell.module.css';

type Theme = 'light' | 'dark';

const CHANGE_EVENT = 'ablin-theme-change';

function readEffectiveTheme(): Theme {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener('change', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function ThemeToggle() {
  // The server cannot know the visitor's theme, so its snapshot is null and the label stays neutral.
  const theme = useSyncExternalStore<Theme | null>(subscribe, readEffectiveTheme, () => null);

  function toggle() {
    const next: Theme = readEffectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private windows); the choice still applies for this visit.
    }
  }

  const label =
    theme === null
      ? 'Switch colour theme'
      : theme === 'dark'
        ? 'Switch to light theme'
        : 'Switch to dark theme';

  return (
    <button type="button" className={styles.iconButton} onClick={toggle} aria-label={label}>
      <Icon name="moon" className={styles.moon} />
      <Icon name="sun" className={styles.sun} />
    </button>
  );
}
