import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/shell/NotFoundContent';
import { SiteChrome } from '@/components/shell/SiteChrome';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

/**
 * Covers a URL that matches no route at all, so no route group's own layout ran (Next.js falls back to the
 * nearest not-found.tsx above the root, which is this one) — wrapped in SiteChrome by hand so it still reads as
 * the public site rather than a bare page. `(site)/not-found.tsx` handles the (more common) case of a
 * notFound() thrown from inside an actual site page; it doesn't need this wrapper because its own layout
 * already supplies it.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  );
}
