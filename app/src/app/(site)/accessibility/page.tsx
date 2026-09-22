import type { Metadata } from 'next';
import { BlockRenderer } from '@/cms/BlockRenderer';
import { getLegalReviewStatus } from '@/cms/legal-review';
import { getPageWithFallback } from '@/cms/store';
import { buildPageMetadata } from '@/lib/seo';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

const SLUG = 'accessibility';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback(SLUG);
  const approved = getLegalReviewStatus(page.blocks) === 'approved';
  return buildPageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: `/${SLUG}`,
    robots: approved ? undefined : { index: false, follow: true },
  });
}

export default async function Page() {
  const page = await getPageWithFallback(SLUG);
  return <BlockRenderer blocks={page.blocks} />;
}
