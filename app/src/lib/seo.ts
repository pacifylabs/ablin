import type { Metadata } from 'next';
import type { BlockImage } from '@/cms/schema';
import { site } from '@/lib/site';

const DEFAULT_OG_IMAGE = '/opengraph-image.png';
const DEFAULT_OG_SIZE = { width: 1200, height: 630 } as const;

export const defaultSiteDescription =
  'Ablin Limited is a UK governance, risk, compliance and technology advisory firm helping organisations manage regulatory, information security, data and AI risk.';

/** Root layout defaults — inherited by pages unless overridden. */
export const rootOpenGraph: NonNullable<Metadata['openGraph']> = {
  siteName: site.name,
  locale: 'en_GB',
  type: 'website',
  images: [
    {
      url: DEFAULT_OG_IMAGE,
      ...DEFAULT_OG_SIZE,
      alt: `${site.name} — ${site.positioning}`,
    },
  ],
};

export const rootTwitter: NonNullable<Metadata['twitter']> = {
  card: 'summary_large_image',
  images: [DEFAULT_OG_IMAGE],
};

export type PageMetadataInput = {
  title: string;
  description: string;
  /** Site path, e.g. `/about` or `/`. */
  path: string;
  /** Home and similar CMS titles that already include the brand name. */
  absoluteTitle?: boolean;
  robots?: Metadata['robots'];
  openGraphType?: 'website' | 'article';
  /** Article cover or other page-specific share image (absolute or site-relative URL). */
  image?: Pick<BlockImage, 'url' | 'width' | 'height' | 'alt'>;
};

function shareImages(image?: PageMetadataInput['image']) {
  if (image) {
    return [
      {
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt.trim() || undefined,
      },
    ];
  }
  return rootOpenGraph.images;
}

/** Canonical, Open Graph and Twitter metadata for a public page. */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description.trim();
  const shortDescription = description.length > 300 ? `${description.slice(0, 297)}…` : description;
  const images = shareImages(input.image);

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
      ...rootTwitter,
      title: input.title,
      description: shortDescription,
      images: input.image ? [input.image.url] : rootTwitter.images,
    },
    robots: input.robots,
  };
}
