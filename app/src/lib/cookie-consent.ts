/** Browser storage key for cookie/analytics consent (essential-only vs analytics allowed). */
export const COOKIE_CONSENT_KEY = 'ablin-cookie-consent';

export type CookieConsentChoice = 'essential' | 'analytics';

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === 'essential' || value === 'analytics' ? value : null;
  } catch {
    return null;
  }
}

export function writeCookieConsent(choice: CookieConsentChoice): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    /* storage blocked — banner stays dismissed for this view only */
  }
}
