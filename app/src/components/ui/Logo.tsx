import Image from 'next/image';
import styles from './Logo.module.css';

export interface LogoAssets {
  /** Artwork for light surfaces. */
  light: string;
  /** Artwork for dark surfaces. */
  dark: string;
  alt: string;
}

interface LogoProps {
  logo: LogoAssets;
  /** `auto` follows the page theme; `onDark` is for surfaces that are dark in both themes (hero, status frame). */
  tone?: 'auto' | 'onDark';
  className?: string;
  priority?: boolean;
}

// Intrinsic size of the supplied wordmark; CSS sets the rendered height and the width follows the artwork.
const WORDMARK = { width: 294, height: 97 } as const;

/**
 * The client's logo, from `settings:site`. Both themed versions are in the markup and CSS shows the right one, so the
 * correct logo appears from first paint with no script (DS v3 §6).
 */
export function Logo({ logo, tone = 'auto', className, priority = false }: LogoProps) {
  const cls = `${styles.logo}${className ? ` ${className}` : ''}`;

  if (tone === 'onDark') {
    return (
      <Image src={logo.dark} alt={logo.alt} className={cls} priority={priority} {...WORDMARK} />
    );
  }

  return (
    <>
      <Image
        src={logo.light}
        alt={logo.alt}
        className={`${cls} ${styles.forLight}`}
        priority={priority}
        {...WORDMARK}
      />
      <Image
        src={logo.dark}
        alt={logo.alt}
        className={`${cls} ${styles.forDark}`}
        priority={priority}
        {...WORDMARK}
      />
    </>
  );
}
