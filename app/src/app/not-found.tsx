import type { Metadata } from 'next';
import { getErrorSettings } from '@/cms/globals';
import { NotFoundContent } from '@/components/shell/NotFoundContent';
import { SiteChrome } from '@/components/shell/SiteChrome';

export async function generateMetadata(): Promise<Metadata> {
  const { notFound } = await getErrorSettings();
  return { title: notFound.title, robots: { index: false } };
}

/**
 * Covers a URL that matches no route at all, so no route group's own layout ran — wrapped in SiteChrome by hand so
 * it still reads as the public site. `(site)/not-found.tsx` handles notFound() thrown from inside a site page.
 */
export default async function NotFound() {
  const { notFound } = await getErrorSettings();
  return (
    <SiteChrome>
      <NotFoundContent copy={notFound} />
    </SiteChrome>
  );
}
