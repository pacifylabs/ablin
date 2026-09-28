import type { Metadata } from 'next';
import { resolveImage } from '@/cms/collections/media';
import type { PageSlug } from '@/cms/schema';
import { absoluteUrl, getSiteUrl } from '@/cms/site-meta';
import { getPublicPage } from '@/cms/public-reads';
import { BlockRenderer } from './BlockRenderer';
import type { RenderContext } from './blocks/types';

/** Metadata for a block page: SEO fields, canonical, share image and noindex all come from page:{slug}. */
export async function pageMetadata(
  slug: PageSlug,
  path: string,
  options: { absoluteTitle?: boolean } = {},
): Promise<Metadata> {
  const [doc, siteUrl] = await Promise.all([getPublicPage(slug), getSiteUrl()]);
  const og = await resolveImage(doc.ogImage);
  const images = og
    ? [{ url: absoluteUrl(siteUrl, og.src), width: og.width, height: og.height, alt: og.alt }]
    : undefined;
  return {
    title: options.absoluteTitle ? { absolute: doc.seoTitle } : doc.seoTitle,
    description: doc.seoDescription,
    alternates: { canonical: path },
    ...(doc.noindex ? { robots: { index: false, follow: true } } : {}),
    ...(images ? { openGraph: { images }, twitter: { images } } : {}),
  };
}

/** Renders page:{slug}'s blocks. Pages are statically rendered; each admin save expires the page's cache tag. */
export async function PageView({ slug, ctx = {} }: { slug: PageSlug; ctx?: RenderContext }) {
  const doc = await getPublicPage(slug);
  return <BlockRenderer blocks={doc.blocks} ctx={{ ...ctx, pageTitle: doc.title }} />;
}
