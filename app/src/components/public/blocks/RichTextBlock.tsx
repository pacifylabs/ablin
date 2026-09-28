import { RichText } from '@/cms/richtext';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './RichTextBlock.module.css';

/** `prose`: a 760px reading column (legal pages, articles). `checklist`: bullet lists as a two-column checklist. */
export function RichTextBlock({ block }: BlockProps<'richText'>) {
  const { data } = block;
  const titleId = `${block.id}-title`;
  const checklist = data.layout === 'checklist';
  return (
    <Section
      anchorId={block.anchorId}
      background={block.background}
      labelledBy={data.title ? titleId : undefined}
      label={data.title ? undefined : undefined}
    >
      <div className={checklist ? `wrap ${styles.checklistLayout}` : `wrap ${styles.narrow}`}>
        {data.title || data.meta ? (
          <div>
            {data.title ? (
              <h2 id={titleId} className={`h2 ${styles.title}`}>
                {data.title}
              </h2>
            ) : null}
            {data.meta ? <p className={styles.meta}>{data.meta}</p> : null}
          </div>
        ) : null}
        <div className={checklist ? `prose ${styles.checklist}` : 'prose'}>
          <RichText doc={data.doc} />
        </div>
      </div>
    </Section>
  );
}
