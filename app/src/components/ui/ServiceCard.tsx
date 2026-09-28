import Link from 'next/link';
import { serviceHref, type Service } from '@/cms/collections/services';

interface ServiceCardProps {
  service: Service;
  /** Show a preview of what the service covers (services index). */
  detailed?: boolean;
}

export function ServiceCard({ service, detailed = false }: ServiceCardProps) {
  return (
    <article className="card">
      <h3>{service.title}</h3>
      <p className="muted">{service.summary}</p>
      {detailed ? (
        <ul className="check-list small">
          {service.detail.covers.slice(0, 3).map((item) => (
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
