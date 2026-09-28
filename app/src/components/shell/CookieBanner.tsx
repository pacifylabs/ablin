'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CookieSettings } from '@/cms/globals/schemas';
import styles from './CookieBanner.module.css';

const CONSENT_KEY = 'ablin-consent';
type Consent = 'granted' | 'denied';

function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  listeners.forEach((l) => l());
}

/** Injects GA4 once, and only after consent. The measurement ID is validated server-side (G-XXXX). */
function loadAnalytics(id: string) {
  if (document.getElementById('ga4-src')) return;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag(...args: unknown[]) {
    w.dataLayer.push(args);
  };
  w.gtag('js', new Date());
  w.gtag('config', id, { anonymize_ip: true });
  const script = document.createElement('script');
  script.id = 'ga4-src';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/**
 * DS v3 §7.15: a bottom-left card, not a full-width bar. Rendered only when a GA4 ID is configured — with no
 * analytics the site sets essential storage only, so there is nothing to ask consent for.
 */
export function CookieBanner({ copy }: { copy: CookieSettings }) {
  // Server snapshot 'pending' keeps the banner out of the SSR HTML, so returning visitors never see it flash.
  const consent = useSyncExternalStore<Consent | null | 'pending'>(
    subscribe,
    readConsent,
    () => 'pending',
  );
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (consent === 'granted') loadAnalytics(copy.ga4Id);
  }, [consent, copy.ga4Id]);

  if (consent !== null) return null;

  return (
    <section className={styles.banner} aria-labelledby="cookie-title" role="region">
      <h2 id="cookie-title" className={styles.title}>
        {showPrefs ? copy.preferencesTitle : copy.title}
      </h2>

      {showPrefs ? (
        <div className={styles.prefs}>
          <div className={styles.pref}>
            <input type="checkbox" id="cookie-necessary" checked disabled />
            <label htmlFor="cookie-necessary">
              <strong>{copy.necessaryTitle}</strong>
              <span>{copy.necessaryText}</span>
            </label>
          </div>
          <div className={styles.pref}>
            <input
              type="checkbox"
              id="cookie-analytics"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            <label htmlFor="cookie-analytics">
              <strong>{copy.analyticsTitle}</strong>
              <span>{copy.analyticsText}</span>
            </label>
          </div>
        </div>
      ) : (
        <p className={styles.body}>
          {copy.body} <Link href={copy.policyLink.href}>{copy.policyLink.label}</Link>
        </p>
      )}

      <div className={styles.actions}>
        {showPrefs ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => writeConsent(analytics ? 'granted' : 'denied')}
          >
            {copy.saveLabel}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => writeConsent('granted')}
            >
              {copy.acceptLabel}
            </button>
            <button type="button" className="btn btn-line" onClick={() => writeConsent('denied')}>
              {copy.rejectLabel}
            </button>
            <button type="button" className={styles.linkButton} onClick={() => setShowPrefs(true)}>
              {copy.preferencesLabel}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
