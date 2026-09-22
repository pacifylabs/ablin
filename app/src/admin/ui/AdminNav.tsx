'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';
import { adminNav } from './nav';

function isCurrent(pathname: string, href: string): boolean {
  return href === '/admin'
    ? pathname === '/admin'
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin">
      {adminNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={styles.navLink}
          data-active={isCurrent(pathname, item.href)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
