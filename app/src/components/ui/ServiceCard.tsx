import Link from 'next/link';
import type { Service } from '@/content/schema';
import { serviceHref } from '@/lib/content';
import { Illustration } from './Illustration';

interface ServiceCardProps {
  service: Service;
  /** Show the illustration and a preview of what the service covers (services index). */
  detailed?: boolean;
}

export function ServiceCard({ service, detailed = false }: ServiceCardProps) {
  return (
    <article className="card">
      {detailed ? (
        <div className="card-media">
          <Illustration scene={service.illustration} />
        </div>
      ) : null}
      <h3>{service.title}</h3>
      <p className="muted">{service.summary}</p>
      {detailed ? (
        <ul className="check-list small">
          {service.covers.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <p className="card-foot">
        <Link href={serviceHref(service.slug)} className="link-quiet">
          View this service<span className="sr-only">: {service.title}</span>
        </Link>
      </p>
    </article>
  );
}
