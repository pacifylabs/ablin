import { Footer } from './Footer';
import { Header } from './Header';
import { SkipLink } from './SkipLink';

/**
 * The public site's header/main/footer, pulled out of the root layout so the admin dashboard and the
 * availability-gate pages can share the root `<html>`/font/theme setup without inheriting the public nav.
 * Used by `(site)/layout.tsx`, and directly by the root `not-found.tsx` so a fully unmatched URL (one that
 * doesn't match any route at all, so no route group's own layout ran) still renders with the public chrome.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
