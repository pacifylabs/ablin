import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getService, listServices, serviceHref } from '@/cms/collections/services';
import { getNavigation, getSeoSettings } from '@/cms/globals';
import { absoluteUrl, defaultShareImage, getSiteUrl } from '@/cms/site-meta';
import { resolveImage } from '@/cms/collections/media';
import { buildPageMetadata } from '@/lib/seo';
import { BlockRenderer } from '@/components/public/BlockRenderer';
import { jsonLdScriptContent } from '@/lib/json-ld';

type Params = Promise<{ service: string }>;

// Pre-render the known services; a service added in the admin renders on first request, then stays cached until
// its `services:{slug}` tag is expired by the next save.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await listServices()).map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const service = await getService((await params).service);
  if (!service) return {};
  const [card, siteUrl, fallback] = await Promise.all([
    resolveImage(service.cardImage),
    getSiteUrl(),
    defaultShareImage(),
  ]);
  return buildPageMetadata({
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.summary,
    path: serviceHref(service.slug),
    image: card
      ? {
          url: absoluteUrl(siteUrl, card.src),
          width: card.width,
          height: card.height,
          alt: card.alt,
        }
      : null,
    defaultImage: fallback,
  });
}

/** DS v3 §7.14: the service's own blocks (pageHeader → checklist → steps → related → contact band). */
export default async function ServicePage({ params }: { params: Params }) {
  const service = await getService((await params).service);
  if (!service) notFound();

  const [siteUrl, seo, nav] = await Promise.all([getSiteUrl(), getSeoSettings(), getNavigation()]);
  const url = `${siteUrl}${serviceHref(service.slug)}`;
  const navLabel = (href: string) => nav.items.find((i) => i.href === href)?.label ?? href;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: service.seoDescription || service.summary,
      url,
      areaServed: seo.organization.areaServed || undefined,
      provider: { '@type': 'Organization', name: seo.organization.name, url: siteUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: navLabel('/'), item: siteUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: navLabel('/services'),
          item: `${siteUrl}/services`,
        },
        { '@type': 'ListItem', position: 3, name: service.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(jsonLd) }}
      />
      <BlockRenderer blocks={service.blocks} ctx={{ pageTitle: service.title }} />
    </>
  );
}
