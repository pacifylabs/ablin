import Link from 'next/link';
import { Illustration } from '@/components/ui/Illustration';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { z } from 'zod';
import type { homeSchema } from '@/content/schema';
import { serviceHref } from '@/lib/content';

type CapabilitiesData = z.infer<typeof homeSchema>['capabilities'];

export function Capabilities({ data }: { data: CapabilitiesData }) {
  return (
    <section className="section" aria-labelledby="capabilities-title">
      <div className="container">
        <SectionHeader id="capabilities-title" title={data.title} lead={data.lead} split />
        <ul className="card-grid cols-3">
          {data.items.map((item) => (
            <li key={item.title}>
              <article className="card">
                <div className="card-media">
                  <Illustration scene={item.illustration} />
                </div>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
                <p className="card-foot">
                  <Link href={serviceHref(item.serviceSlug)} className="link-quiet">
                    View this service<span className="sr-only">: {item.title}</span>
                  </Link>
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
