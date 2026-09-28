import Link from 'next/link';
import { resolveImage } from '@/cms/collections/media';
import { listServices, serviceHref } from '@/cms/collections/services';
import { Heading } from '../Heading';
import { Photo } from '../Photo';
import { Section } from '../Section';
import { CarouselNav } from './CarouselNav';
import type { BlockProps } from './types';
import styles from './ServiceCarousel.module.css';

/** DS v3 §7.7: service cards from the collection, as a scroll-snap carousel or a plain grid. */
export async function ServiceCarousel({ block }: BlockProps<'serviceCarousel'>) {
  const { data } = block;
  const all = await listServices();
  const services =
    data.serviceSlugs.length === 0
      ? all
      : data.serviceSlugs.flatMap((slug) => all.filter((s) => s.slug === slug));
  if (services.length === 0) return null;

  const cards = await Promise.all(
    services.map(async (s) => ({ service: s, image: await resolveImage(s.cardImage) })),
  );
  const titleId = `${block.id}-title`;
  const trackId = `${block.id}-track`;
  const carousel = data.variant === 'carousel';

  return (
    <Section
      anchorId={block.anchorId}
      background={block.background}
      labelledBy={data.title ? titleId : undefined}
      label={data.title ? undefined : data.trackLabel}
    >
      <div className="wrap">
        {data.title || carousel ? (
          <div className={styles.head}>
            <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} lead={data.lead} />
            {carousel ? (
              <CarouselNav
                trackId={trackId}
                prevLabel={data.prevLabel}
                nextLabel={data.nextLabel}
              />
            ) : null}
          </div>
        ) : null}
        <ul
          id={trackId}
          className={carousel ? styles.track : styles.grid}
          {...(carousel ? { tabIndex: 0, 'aria-label': data.trackLabel } : {})}
        >
          {cards.map(({ service, image }) => (
            <li key={service.slug} className={styles.card}>
              <Link href={serviceHref(service.slug)} className={styles.cardLink}>
                <span className={styles.media}>
                  {image ? (
                    <Photo
                      image={image}
                      fill
                      sizes="(max-width: 600px) 78vw, (max-width: 1240px) 33vw, 300px"
                    />
                  ) : null}
                  <span className={styles.code}>{service.code}</span>
                </span>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <span className={styles.more}>
                  {data.cardLinkLabel}
                  <span aria-hidden="true"> →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
