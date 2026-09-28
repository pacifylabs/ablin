import Link from 'next/link';
import { resolveImage } from '@/cms/collections/media';
import { Heading } from '../Heading';
import { Photo } from '../Photo';
import { Section } from '../Section';
import { Steps } from './Steps';
import type { BlockProps } from './types';
import styles from './ApproachSplit.module.css';

/** DS v3 §7.8: heading and a 4:5 photo with a round navy badge; the numbered steps beside them. */
export async function ApproachSplit({ block }: BlockProps<'approachSplit'>) {
  const { data } = block;
  const image = await resolveImage(data.image);
  const titleId = `${block.id}-title`;
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className={`wrap ${styles.split}`}>
        <div>
          <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} lead={data.lead} />
          {image || data.badge ? (
            <div className={styles.media}>
              {image ? (
                <div className={styles.photo}>
                  <Photo image={image} fill sizes="(max-width: 1000px) 100vw, 560px" />
                </div>
              ) : null}
              {data.badge ? (
                <Link href={data.badge.href} className={styles.badge}>
                  {data.badge.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
        <Steps steps={data.steps} />
      </div>
    </Section>
  );
}
