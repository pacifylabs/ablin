import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/shell/CtaBand';
import blocks from '@/components/ui/blocks.module.css';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { jsonLdScriptContent } from '@/lib/json-ld';
import { getApproach, getAudiences } from '@/lib/content';
import { getService, listServices, serviceHref } from '@/cms/collections/services';
import { getNavigation } from '@/cms/globals';
import { getSeoSettings } from '@/cms/globals';
import { getSiteUrl } from '@/cms/site-meta';

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
  return {
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.summary,
    alternates: { canonical: serviceHref(service.slug) },
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const service = await getService((await params).service);
  if (!service) notFound();

  const { detail } = service;
  const [approach, allAudiences, allServices, nav] = await Promise.all([
    getApproach(),
    getAudiences(),
    listServices(),
    getNavigation(),
  ]);
  const audiences = allAudiences.filter((a) => detail.whoFor.includes(a.slug));
  const related = allServices.filter((s) => detail.related.includes(s.slug));
  const [siteUrl, seo] = await Promise.all([getSiteUrl(), getSeoSettings()]);
  const url = `${siteUrl}${serviceHref(service.slug)}`;
  const navLabel = (href: string) => nav.items.find((i) => i.href === href)?.label ?? href;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: detail.definition,
      url,
      areaServed: 'GB',
      provider: { '@type': 'Organization', name: seo.organization.name, url: siteUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: navLabel('/'), item: siteUrl },
        { '@type': 'ListItem', position: 2, name: navLabel('/services'), item: `${siteUrl}/services` },
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
      <PageHero
        title={service.title}
        lead={detail.definition}
        scene="structure"
        kicker={service.code}
      >
        <Button href={nav.cta.href}>{nav.cta.label}</Button>
      </PageHero>

      <section className="section" aria-labelledby="covers-title">
        <div className="container">
          <SectionHeader id="covers-title" title={detail.coversTitle} />
          <ul className={`check-list ${blocks.covers}`}>
            {detail.covers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-surface" aria-labelledby="how-title">
        <div className="container">
          <SectionHeader
            id="how-title"
            title={detail.howTitle}
            lead={detail.howLead || undefined}
          />
          <ol className={blocks.how}>
            {detail.howWeWork.map((line, index) => {
              const step = approach.steps[index];
              return (
                <li key={line} className={blocks.howStep}>
                  <span className={blocks.howNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{step?.title}</h3>
                  <p className="muted">{line}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="for-title">
        <div className="container">
          <SectionHeader id="for-title" title={detail.whoForTitle} />
          <ul className="card-grid cols-2">
            {audiences.map((audience) => (
              <li key={audience.slug}>
                <article className="card">
                  <h3>{audience.title}</h3>
                  <p className="muted">{audience.summary}</p>
                  <p className="card-foot">
                    <Link href={`/who-we-serve#${audience.slug}`} className="link-quiet">
                      See who we serve<span className="sr-only">: {audience.title}</span>
                    </Link>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-surface" aria-labelledby="related-title">
        <div className="container">
          <SectionHeader id="related-title" title={detail.relatedTitle} />
          <ul className="card-grid cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ServiceCard service={item} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title={detail.ctaTitle}
        body={detail.ctaText}
        primary={nav.cta}
      />
    </>
  );
}
