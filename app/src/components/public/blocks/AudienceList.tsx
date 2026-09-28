import Link from 'next/link';
import { resolveImage } from '@/cms/collections/media';
import { Heading } from '../Heading';
import { Photo } from '../Photo';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './AudienceList.module.css';

/** DS v3 §7.9: audiences on the left; a tall photo with a floating question panel on the right. */
export async function AudienceList({ block }: BlockProps<'audienceList'>) {
  const { data } = block;
  const image = await resolveImage(data.image);
  const titleId = `${block.id}-title`;
  const aside = image || data.note;
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className={`wrap ${aside ? styles.split : ''}`}>
        <div>
          <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} lead={data.lead} />
          <ul className={styles.list}>
            {data.items.map((item) => (
              <li key={item.title} id={item.anchorId || undefined}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
        {aside ? (
          <div className={styles.media}>
            {image ? <Photo image={image} fill sizes="(max-width: 1000px) 100vw, 600px" /> : null}
            {data.note ? (
              <div className={styles.note}>
                <div>
                  <p className={styles.noteTitle}>{data.note.title}</p>
                  {data.note.text ? <p className={styles.noteText}>{data.note.text}</p> : null}
                </div>
                <Link href={data.note.cta.href} className={`btn btn-primary ${styles.noteBtn}`}>
                  {data.note.cta.label}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
