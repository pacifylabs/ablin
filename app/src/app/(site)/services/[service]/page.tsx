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
import { config } from '@/lib/config';
import { getApproach, getAudiences, getImage, getService, getServices, serviceHref } from '@/lib/content';
import { serviceHeroImageId } from '@/lib/service-hero-image';
import { buildPageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

type Params = Promise<{ service: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getServices()).map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const service = await getService((await params).service);
  if (!service) return {};
  return buildPageMetadata({
    title: service.title,
    description: `${service.summary} ${service.definition}`,
    path: serviceHref(service.slug),
  });
}

export default async function ServicePage({ params }: { params: Params }) {
  const service = await getService((await params).service);
  if (!service) notFound();

  const [approach, allAudiences, allServices, heroImage] = await Promise.all([
    getApproach(),
    getAudiences(),
    getServices(),
    getImage(serviceHeroImageId(service.slug)),
  ]);
  const audiences = allAudiences.filter((a) => service.whoFor.includes(a.slug));
  const related = allServices.filter((s) => service.related.includes(s.slug));
  const url = `${config.siteUrl}${serviceHref(service.slug)}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: service.definition,
      url,
      areaServed: 'GB',
      provider: { '@type': 'Organization', name: site.name, url: config.siteUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: config.siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${config.siteUrl}/services` },
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
        lead={service.definition}
        scene={service.illustration}
        image={heroImage}
        kicker="Services"
      >
        <Button href="/contact">Request a consultation</Button>
        <Button href="/services" variant="ghost">
          All services
        </Button>
      </PageHero>

      <section className="section" aria-labelledby="covers-title">
        <div className="container">
          <SectionHeader id="covers-title" title="What this covers" />
          <ul className={`check-list ${blocks.covers}`}>
            {service.covers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-surface" aria-labelledby="how-title">
        <div className="container">
          <SectionHeader
            id="how-title"
            title="How we work on this"
            lead="The same five steps apply to every service, applied here to this work."
          />
          <ol className={blocks.how}>
            {service.howWeWork.map((line, index) => {
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
          <SectionHeader id="for-title" title="Who it's for" />
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
          <SectionHeader id="related-title" title="Related services" />
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
        title={service.ctaTitle}
        body="Tell us what you are working towards and we will advise on where to start."
        primary={{ label: 'Speak to our consultants', href: '/contact' }}
      />
    </>
  );
}
