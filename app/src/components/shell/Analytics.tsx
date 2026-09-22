'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { readCookieConsent } from '@/lib/cookie-consent';

/** Loads Google Analytics only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set and the visitor accepted analytics. */
export function Analytics({ measurementId }: { measurementId: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function sync() {
      setEnabled(readCookieConsent() === 'analytics');
    }
    sync();
    window.addEventListener('ablin-cookie-consent', sync);
    return () => window.removeEventListener('ablin-cookie-consent', sync);
  }, []);

  if (!measurementId || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ablin-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
