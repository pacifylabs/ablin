import type { Metadata } from 'next';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getPageWithFallback } from '@/cms/store';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback('services');
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: '/services' },
  };
}

export default async function ServicesPage() {
  const page = await getPageWithFallback('services');
  return <BlockRenderer blocks={page.blocks} />;
}
