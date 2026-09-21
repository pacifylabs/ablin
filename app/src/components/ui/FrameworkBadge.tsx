import Image from 'next/image';
import type { Framework } from '@/content/schema';
import styles from './FrameworkBadge.module.css';

/**
 * Custom glyphs for the frameworks Ablin advises on. They are deliberately abstract (rings, nodes, a grid, a cycle)
 * and are NOT seals, rosettes or shields, so nothing here can be mistaken for an official mark or a certification.
 *
 * LOGO SLOT: to show an official logo, add a `logo` object to the framework in content/frameworks.json
 * ({ src, alt, width, height, approvedBy, licenceRef }). It renders only when every field is present, meaning the
 * client has approved it and holds the right to use it. Until then this glyph is shown.
 */
function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const p = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(2)} ${(cy + r * Math.sin(rad)).toFixed(2)}`;
  };
  return `M${p(from)} A${r} ${r} 0 0 1 ${p(to)}`;
}

const glyphs: Record<Framework['id'], React.ReactNode> = {
  'iso-27001': (
    <>
      <circle cx="20" cy="20" r="18" strokeDasharray="30 9" />
      <circle cx="20" cy="20" r="12" strokeDasharray="21 7" />
      <circle cx="20" cy="20" r="6" />
      <circle cx="20" cy="20" r="1.8" fill="currentColor" stroke="none" />
    </>
  ),
  'iso-42001': (
    <>
      <path d="M20 8L8 30H32Z" />
      <path d="M20 22L20 8M20 22L8 30M20 22L32 30" opacity="0.55" />
      <circle cx="20" cy="8" r="3.5" fill="var(--panel)" />
      <circle cx="8" cy="30" r="3.5" fill="var(--panel)" />
      <circle cx="32" cy="30" r="3.5" fill="var(--panel)" />
      <circle cx="20" cy="22" r="2.4" fill="currentColor" stroke="none" />
    </>
  ),
  'uk-gdpr': (
    <>
      <rect x="6" y="6" width="28" height="28" rx="7" strokeDasharray="4 4" />
      <circle cx="20" cy="17" r="4.5" />
      <path d="M11.5 30c1.6-4.6 5-6.4 8.5-6.4s6.9 1.8 8.5 6.4" />
    </>
  ),
  'soc-2': (
    <>
      <rect x="7" y="7" width="12" height="12" rx="2.5" />
      <rect x="21" y="7" width="12" height="12" rx="2.5" />
      <rect x="7" y="21" width="12" height="12" rx="2.5" />
      <rect x="21" y="21" width="12" height="12" rx="2.5" fill="currentColor" />
    </>
  ),
  'nist-ai-rmf': (
    <>
      {[10, 100, 190, 280].map((start) => (
        <path key={start} d={arc(20, 20, 13, start, start + 70)} strokeWidth="2" />
      ))}
      <circle cx="20" cy="20" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
};

export function FrameworkBadge({
  framework,
  size = 56,
  tone = 'default',
}: {
  framework: Framework;
  size?: number;
  /** `onDark` is for the navy footer. */
  tone?: 'default' | 'onDark';
}) {
  const { logo } = framework;
  // Belt and braces: the schema already requires these, and a licence-less logo must never render.
  const licensed = logo && logo.approvedBy && logo.licenceRef;

  return (
    <span
      className={`${styles.badge}${tone === 'onDark' ? ` ${styles.onDark}` : ''}`}
      style={{ width: size, height: size }}
      aria-hidden={licensed ? undefined : true}
    >
      {licensed ? (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className={styles.logo}
        />
      ) : (
        <svg
          viewBox="0 0 40 40"
          width={size * 0.66}
          height={size * 0.66}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          {glyphs[framework.id]}
        </svg>
      )}
    </span>
  );
}
