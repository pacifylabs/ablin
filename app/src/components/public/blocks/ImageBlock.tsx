import { resolveImage } from '@/cms/collections/media';
import { Photo } from '../Photo';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './ImageBlock.module.css';

export async function ImageBlock({ block }: BlockProps<'image'>) {
  const { data } = block;
  const image = await resolveImage(data.image);
  if (!image) return null;
  const ratio = data.ratio === 'auto' ? undefined : data.ratio.replace('/', ' / ');
  return (
    <Section
      anchorId={block.anchorId}
      background={block.background}
      label={image.alt || undefined}
      pad="tight"
    >
      <figure className={`wrap ${styles.figure}`}>
        <div className={styles.frame} style={ratio ? { aspectRatio: ratio } : undefined}>
          <Photo image={image} fill={Boolean(ratio)} sizes="(max-width: 1240px) 100vw, 1240px" />
        </div>
        {data.caption ? <figcaption className={styles.caption}>{data.caption}</figcaption> : null}
      </figure>
    </Section>
  );
}
