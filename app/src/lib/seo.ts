import type { Metadata } from 'next';

export interface ShareImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export type PageMetadataInput = {
  title: string;
  description: string;
  /** Site path, e.g. `/about` or `/`. */
  path: string;
  /** Home and similar CMS titles that already include the brand name. */
  absoluteTitle?: boolean;
  robots?: Metadata['robots'];
  openGraphType?: 'website' | 'article';
  /** Page-specific share image; falls back to `defaultImage` (settings:seo). */
  image?: ShareImage | null;
  defaultImage?: ShareImage | null;
};

/**
 * Canonical, Open Graph and Twitter metadata for a public page. Next replaces (not merges) a page's `openGraph` and
 * `twitter` objects over the root layout's, so the site default share image is passed in explicitly.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description.trim();
  const shortDescription = description.length > 300 ? `${description.slice(0, 297)}…` : description;
  const image = input.image ?? input.defaultImage ?? null;
  const images = image
    ? [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt?.trim() || undefined,
        },
      ]
    : undefined;

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: shortDescription,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: shortDescription,
      url: input.path,
      type: input.openGraphType ?? 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: shortDescription,
      images: image ? [image.url] : undefined,
    },
    robots: input.robots,
  };
}
