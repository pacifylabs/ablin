import type { Metadata } from 'next';
import { BlockRenderer, getLegalReviewStatus } from '@/cms/BlockRenderer';
import { getPageWithFallback } from '@/cms/store';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

const SLUG = 'cookie-policy';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback(SLUG);
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/${SLUG}` },
    robots:
      getLegalReviewStatus(page.blocks) === 'approved' ? undefined : { index: false, follow: true },
  };
}

export default async function Page() {
  const page = await getPageWithFallback(SLUG);
  return <BlockRenderer blocks={page.blocks} />;
}
