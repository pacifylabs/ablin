import Link from 'next/link';
import { resolveImage } from '@/cms/collections/media';
import { getNavigation } from '@/cms/globals';
import { Photo } from '../Photo';
import type { BlockProps } from './types';
import styles from './PageHeader.module.css';

/**
 * DS v3 §7.14: inner-page header. With a photo it is a smaller framed navy banner (min 320px); without one it is a
 * plain header on the block's background (legal pages). The breadcrumb's first label comes from navigation.
 */
export async function PageHeader({ block }: BlockProps<'pageHeader'>) {
  const { data } = block;
  const [image, nav] = await Promise.all([resolveImage(data.image), getNavigation()]);
  const titleId = `${block.id}-title`;
  const home = nav.items.find((i) => i.href === '/');
  const framed = image !== null;

  const copy = (
    <div className={styles.copy}>
      {data.breadcrumb && home ? (
        <nav aria-label={nav.labels.breadcrumb} className={styles.crumbs}>
          <ol>
            <li>
              <Link href="/">{home.label}</Link>
            </li>
            <li aria-current="page">{data.title}</li>
          </ol>
        </nav>
      ) : null}
      {data.eyebrow ? <p className={styles.eyebrow}>{data.eyebrow}</p> : null}
      <h1 id={titleId} className={styles.title}>
        {data.title}
      </h1>
      {data.lead ? <p className={styles.lead}>{data.lead}</p> : null}
      {data.cta ? (
        <div>
          <Link href={data.cta.href} className={framed ? 'btn btn-white' : 'btn btn-primary'}>
            {data.cta.label}
          </Link>
        </div>
      ) : null}
    </div>
  );

  if (!framed) {
    return (
      <section
        id={block.anchorId || undefined}
        data-bg={block.background}
        className={styles.plain}
        aria-labelledby={titleId}
      >
        <div className="wrap">{copy}</div>
      </section>
    );
  }

  return (
    <section
      id={block.anchorId || undefined}
      className={`wrap ${styles.outer}`}
      aria-labelledby={titleId}
    >
      <div className={`${styles.frame} on-navy`}>
        <Photo
          image={{ ...image, alt: '' }}
          fill
          priority
          sizes="(max-width: 1240px) 100vw, 1240px"
        />
        <div className={styles.shade} aria-hidden="true" />
        {copy}
      </div>
    </section>
  );
}
