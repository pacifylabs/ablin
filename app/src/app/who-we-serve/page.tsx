import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/shell/CtaBand';
import blocks from '@/components/ui/blocks.module.css';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getAudiences, getImage, getServices, getWhoWeServePage, serviceHref } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Who We Serve',
  description:
    'The organisations Ablin Limited advises: growing businesses, technology firms, regulated organisations, professional services and organisations adopting AI.',
  alternates: { canonical: '/who-we-serve' },
};

export default async function WhoWeServePage() {
  const [page, audiences, services] = await Promise.all([
    getWhoWeServePage(),
    getAudiences(),
    getServices(),
  ]);
  const image = page.image ? await getImage(page.image) : undefined;
  const titleBySlug = new Map(services.map((s) => [s.slug, s.title]));

  return (
    <>
      <PageHero title={page.title} lead={page.lead} scene={page.illustration} image={image} />

      <section className="section section-surface" aria-labelledby="groups-title">
        <div className="container">
          <SectionHeader id="groups-title" title={page.groups.title} lead={page.groups.lead} />
          <ul className={blocks.rows}>
            {audiences.map((audience) => (
              <li key={audience.slug} id={audience.slug} className={blocks.row}>
                <div className={blocks.rowText}>
                  <h3>{audience.title}</h3>
                  <p className="muted">{audience.description}</p>
                </div>
                <nav className={blocks.rowLinks} aria-label={`Services for ${audience.title}`}>
                  <p className="kicker">Relevant services</p>
                  {audience.services.map((slug) => (
                    <Link key={slug} href={serviceHref(slug)}>
                      {titleBySlug.get(slug) ?? slug}
                    </Link>
                  ))}
                </nav>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title={page.cta.title} body={page.cta.body} primary={page.cta.primary} />
    </>
  );
}
