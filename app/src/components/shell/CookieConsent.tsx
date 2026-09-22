'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentChoice,
} from '@/lib/cookie-consent';
import styles from './shell.module.css';

/**
 * Shown until the visitor chooses essential-only or analytics cookies. Analytics scripts load only after
 * "Accept analytics" (see Analytics.tsx).
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readCookieConsent() === null);
  }, []);

  function choose(choice: CookieConsentChoice) {
    writeCookieConsent(choice);
    setVisible(false);
    window.dispatchEvent(new CustomEvent('ablin-cookie-consent', { detail: choice }));
  }

  if (!visible) return null;

  return (
    <div className={styles.cookieBanner} role="dialog" aria-labelledby="cookie-banner-title">
      <div className={styles.cookieBannerInner}>
        <p id="cookie-banner-title" className={styles.cookieBannerTitle}>
          Cookies on this website
        </p>
        <p className="small muted">
          We use essential storage for your theme preference. With your permission we also use Google Analytics
          to understand how the site is used. See our{' '}
          <Link href="/cookie-policy" className="link-quiet">
            Cookie Policy
          </Link>
          .
        </p>
        <div className={styles.cookieBannerActions}>
          <button type="button" className="btn btn-primary" onClick={() => choose('analytics')}>
            Accept analytics
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => choose('essential')}>
            Essential only
          </button>
        </div>
      </div>
    </div>
  );
}
