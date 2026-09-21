import type { Metadata } from 'next';
import { Approach } from '@/components/home/Approach';
import { CtaBand } from '@/components/shell/CtaBand';
import { FrameworkBand } from '@/components/ui/FrameworkBand';
import { PageHero } from '@/components/ui/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceCard } from '@/components/ui/ServiceCard';
import {
  getApproach,
  getFrameworks,
  getHome,
  getImage,
  getServices,
  getServicesPage,
} from '@/lib/content';

export const metadata: Metadata = {
  title: 'Services — GRC, Cybersecurity, Data Protection & AI Governance',
  description:
    'Eight advisory services: governance, risk and compliance, ISO readiness, data protection, AI governance, cybersecurity governance, technology risk, SOC 2 readiness, and audit and assurance.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const [page, services, frameworks, approach, home] = await Promise.all([
    getServicesPage(),
    getServices(),
    getFrameworks(),
    getApproach(),
    getHome(),
  ]);
  const image = page.image ? await getImage(page.image) : undefined;

  return (
    <>
      <PageHero title={page.title} lead={page.lead} scene={page.illustration} image={image} />

      <section className="section section-surface" aria-labelledby="catalogue-title">
        <div className="container">
          <SectionHeader
            id="catalogue-title"
            title={page.catalogue.title}
            lead={page.catalogue.lead}
          />
          <ul className="card-grid cols-4">
            {services.map((service) => (
              <li key={service.slug}>
                <ServiceCard service={service} detailed />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FrameworkBand
        id="services-frameworks-title"
        title={home.frameworks.title}
        lead={home.frameworks.lead}
        note={home.frameworks.note}
        frameworks={frameworks}
      />
      <Approach data={approach} id="services-approach-title" />
      <CtaBand title={page.cta.title} body={page.cta.body} primary={page.cta.primary} />
    </>
  );
}
