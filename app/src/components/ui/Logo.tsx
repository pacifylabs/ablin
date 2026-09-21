import Image from 'next/image';
import { site } from '@/lib/site';
import styles from './Logo.module.css';

interface LogoProps {
  /** `auto` follows the page theme; `onDark` is for surfaces that are dark in both themes (the footer). */
  tone?: 'auto' | 'onDark';
  /** Rendered height in CSS; width follows the artwork's aspect ratio. */
  className?: string;
  priority?: boolean;
}

// Trimmed from the supplied artwork in public/image (the tagline is dropped: unreadable at this size).
const WORDMARK = { width: 294, height: 97 } as const;

/**
 * The supplied Ablin logo. Both themed versions are in the markup and CSS shows the right one, so the
 * correct logo appears from first paint with no script (same approach as the theme toggle icons).
 */
export function Logo({ tone = 'auto', className, priority = false }: LogoProps) {
  const alt = `${site.name} logo`;
  const cls = `${styles.logo}${className ? ` ${className}` : ''}`;

  if (tone === 'onDark') {
    return (
      <Image
        src="/image/logo-wordmark-dark.png"
        alt={alt}
        className={cls}
        priority={priority}
        {...WORDMARK}
      />
    );
  }

  return (
    <>
      <Image
        src="/image/logo-wordmark-light.png"
        alt={alt}
        className={`${cls} ${styles.forLight}`}
        priority={priority}
        {...WORDMARK}
      />
      <Image
        src="/image/logo-wordmark-dark.png"
        alt={alt}
        className={`${cls} ${styles.forDark}`}
        priority={priority}
        {...WORDMARK}
      />
    </>
  );
}
