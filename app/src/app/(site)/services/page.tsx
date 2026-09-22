import type { Metadata } from 'next';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getPageWithFallback } from '@/cms/store';
import { buildPageMetadata } from '@/lib/seo';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback('services');
  return buildPageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: '/services',
  });
}

export default async function ServicesPage() {
  const page = await getPageWithFallback('services');
  return <BlockRenderer blocks={page.blocks} />;
}
