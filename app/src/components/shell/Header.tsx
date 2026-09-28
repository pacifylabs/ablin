'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NavigationSettings } from '@/cms/globals/schemas';
import { Icon } from '@/components/ui/Icon';
import { Logo, type LogoAssets } from '@/components/ui/Logo';
import { ThemeToggle } from './ThemeToggle';
import styles from './shell.module.css';

// Matches the 1000px breakpoint in shell.module.css (DS v3 §4).
const DESKTOP_QUERY = '(min-width: 1001px)';

function isCurrent(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

interface HeaderProps {
  nav: NavigationSettings;
  logo: LogoAssets;
}

/** DS v3 §7.1: sticky, translucent, logo · six links · CTA · theme toggle; a disclosure menu at ≤1000px. */
export function Header({ nav, logo }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const { labels } = nav;

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) menuButton.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // If the viewport grows past the mobile breakpoint the disclosure is irrelevant; don't leave it "expanded".
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => media.matches && setOpen(false);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={labels.home}>
          <Logo logo={{ ...logo, alt: '' }} priority />
        </Link>

        <nav aria-label={labels.primaryNav} className={styles.nav}>
          <ul className={styles.navList}>
            {nav.items.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link href={nav.cta.href} className={`btn btn-primary ${styles.cta}`}>
            {nav.cta.label}
          </Link>
          <ThemeToggle labels={labels} />
          <button
            ref={menuButton}
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? labels.closeMenu : labels.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={styles.panel} hidden={!open}>
        <nav aria-label={labels.mobileNav} className="wrap">
          <ul className={styles.panelList}>
            {nav.items.map((item, index) => (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  ref={index === 0 ? firstLink : undefined}
                  className={styles.panelLink}
                  aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                  onClick={() => close(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={nav.cta.href}
            className={`btn btn-primary ${styles.panelCta}`}
            onClick={() => close(false)}
          >
            {nav.cta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
