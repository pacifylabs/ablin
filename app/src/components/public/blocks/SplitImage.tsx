import Link from 'next/link';
import { resolveImage } from '@/cms/collections/media';
import { RichText } from '@/cms/richtext';
import { Heading } from '../Heading';
import { Photo } from '../Photo';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './SplitImage.module.css';

/** Rich text beside a large photo that fills its column (DS v3 §5: min 520px desktop, 420px tablet). */
export async function SplitImage({ block }: BlockProps<'splitImage'>) {
  const { data } = block;
  const image = await resolveImage(data.image);
  const titleId = `${block.id}-title`;
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className={`wrap ${styles.split}${data.imageSide === 'left' ? ` ${styles.left}` : ''}`}>
        <div className={styles.text}>
          <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} />
          <div className="prose">
            <RichText doc={data.body} />
          </div>
          {data.cta ? (
            <div>
              <Link href={data.cta.href} className="btn btn-primary">
                {data.cta.label}
              </Link>
            </div>
          ) : null}
        </div>
        {image ? (
          <div className={styles.media}>
            <Photo image={image} fill sizes="(max-width: 1000px) 100vw, 600px" />
          </div>
        ) : null}
      </div>
    </Section>
  );
}
