'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CookieSettings } from '@/cms/globals/schemas';
import {
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentChoice,
} from '@/lib/cookie-consent';
import styles from './CookieBanner.module.css';

const CONSENT_EVENT = 'ablin-cookie-consent';

const listeners = new Set<() => void>();
function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener(CONSENT_EVENT, onChange);
  };
}

function choose(value: CookieConsentChoice) {
  writeCookieConsent(value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
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
 * DS v3 §7.15: a bottom-left card, not a full-width bar, shown until the visitor chooses. Analytics (GA4) load only
 * after "Accept". The choice is stored under the same key and values as before the redesign, so visitors who already
 * chose are not asked again. `ga4Id` is settings:cookies.ga4Id, else NEXT_PUBLIC_GA_MEASUREMENT_ID.
 */
export function CookieBanner({ copy, ga4Id }: { copy: CookieSettings; ga4Id: string }) {
  // Server snapshot 'pending' keeps the banner out of the SSR HTML, so returning visitors never see it flash.
  const consent = useSyncExternalStore<CookieConsentChoice | null | 'pending'>(
    subscribe,
    readCookieConsent,
    () => 'pending',
  );
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (consent === 'analytics' && ga4Id) loadAnalytics(ga4Id);
  }, [consent, ga4Id]);

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
            onClick={() => choose(analytics ? 'analytics' : 'essential')}
          >
            {copy.saveLabel}
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={() => choose('analytics')}>
              {copy.acceptLabel}
            </button>
            <button type="button" className="btn btn-line" onClick={() => choose('essential')}>
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
