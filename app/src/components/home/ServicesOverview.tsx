import Link from 'next/link';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceCard } from '@/components/ui/ServiceCard';
import type { z } from 'zod';
import type { homeSchema, Service } from '@/content/schema';
import styles from './home.module.css';

type Section = z.infer<typeof homeSchema>['services'];

/** A catalogue, not a sequence: deliberately unnumbered (Design System v2 §10.7). */
export function ServicesOverview({
  data,
  services,
}: {
  data: Section;
  services: readonly Service[];
}) {
  return (
    <section className="section section-surface" aria-labelledby="services-title">
      <div className="container">
        <SectionHeader
          id="services-title"
          kicker={data.kicker}
          title={data.title}
          lead={data.lead}
        />
        <ul className="card-grid cols-4">
          {services.map((service) => (
            <li key={service.slug}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
        <p className={styles.moreLink}>
          <Link href="/services" className="link-quiet">
            View all services
          </Link>
        </p>
      </div>
    </section>
  );
}
