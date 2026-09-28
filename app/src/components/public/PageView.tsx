import type { Metadata } from 'next';
import { resolveImage } from '@/cms/collections/media';
import type { PageSlug } from '@/cms/schema';
import { absoluteUrl, defaultShareImage, getSiteUrl } from '@/cms/site-meta';
import { buildPageMetadata } from '@/lib/seo';
import { getPublicPage } from '@/cms/public-reads';
import { BlockRenderer } from './BlockRenderer';
import type { RenderContext } from './blocks/types';

/** Metadata for a block page: SEO fields, canonical, share image and noindex all come from page:{slug}. */
export async function pageMetadata(
  slug: PageSlug,
  path: string,
  options: { absoluteTitle?: boolean } = {},
): Promise<Metadata> {
  const [doc, siteUrl, fallback] = await Promise.all([
    getPublicPage(slug),
    getSiteUrl(),
    defaultShareImage(),
  ]);
  const og = await resolveImage(doc.ogImage);
  return buildPageMetadata({
    title: doc.seoTitle,
    description: doc.seoDescription,
    path,
    absoluteTitle: options.absoluteTitle,
    robots: doc.noindex ? { index: false, follow: true } : undefined,
    image: og
      ? { url: absoluteUrl(siteUrl, og.src), width: og.width, height: og.height, alt: og.alt }
      : null,
    defaultImage: fallback,
  });
}

/** Renders page:{slug}'s blocks. Pages are statically rendered; each admin save expires the page's cache tag. */
export async function PageView({ slug, ctx = {} }: { slug: PageSlug; ctx?: RenderContext }) {
  const doc = await getPublicPage(slug);
  return <BlockRenderer blocks={doc.blocks} ctx={{ ...ctx, pageTitle: doc.title }} />;
}
