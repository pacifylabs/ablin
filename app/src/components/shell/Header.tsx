'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { headerCta, primaryNav, site } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';
import styles from './shell.module.css';

const DESKTOP_QUERY = '(min-width: 70rem)';

function isCurrent(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) menuButton.current?.focus();
  }, []);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    <header className={styles.header} data-condensed={condensed}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.wordmark} aria-label={`${site.name} home`}>
          <Logo priority className={styles.headerLogo} />
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          <ul className={styles.navList}>
            {primaryNav.map((item) => (
              <li key={item.href}>
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
          <Link href={headerCta.href} className={`btn btn-primary ${styles.cta}`}>
            {headerCta.label}
          </Link>
          <ThemeToggle />
          <button
            ref={menuButton}
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={styles.panel} hidden={!open}>
        <nav aria-label="Mobile primary" className="container">
          <ul className={styles.panelList}>
            {primaryNav.map((item, index) => (
              <li key={item.href}>
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
            href={headerCta.href}
            className={`btn btn-primary ${styles.panelCta}`}
            onClick={() => close(false)}
          >
            {headerCta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
