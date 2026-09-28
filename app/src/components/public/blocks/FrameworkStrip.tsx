import { getFrameworks, withMarks } from '@/cms/collections/frameworks';
import { FrameworkMark } from '../FrameworkMark';
import { Heading } from '../Heading';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './FrameworkStrip.module.css';

/** DS v3 §7.6: a row of marks between hairlines (`strip`), or cards with publisher and sources (`index`). */
export async function FrameworkStrip({ block }: BlockProps<'frameworkStrip'>) {
  const { data } = block;
  const all = await withMarks(await getFrameworks());
  const frameworks =
    data.frameworkIds.length === 0
      ? all
      : data.frameworkIds.flatMap((id) => all.filter((f) => f.id === id));
  if (frameworks.length === 0) return null;
  const titleId = `${block.id}-title`;

  if (data.variant === 'strip') {
    return (
      <Section
        anchorId={block.anchorId}
        background={block.background}
        labelledBy={data.title ? titleId : undefined}
        label={data.title ? undefined : frameworks.map((f) => f.name).join(', ')}
      >
        <div className="wrap">
          {data.title ? <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} /> : null}
          <div className={styles.strip}>
            <ul className={styles.row}>
              {frameworks.map((f) => (
                <li key={f.id} className={styles.item}>
                  <FrameworkMark framework={f} />
                  <span>
                    <b>{f.name}</b>
                    <small>{f.descriptor}</small>
                  </span>
                </li>
              ))}
            </ul>
            {data.caption ? <p className={styles.caption}>{data.caption}</p> : null}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className="wrap">
        <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} className={styles.head} />
        <ul className={styles.grid}>
          {frameworks.map((f) => (
            <li key={f.id} className={styles.card}>
              <span className={styles.cardMark}>
                <FrameworkMark framework={f} size={32} />
              </span>
              <h3>{f.name}</h3>
              <p className={styles.muted}>{f.descriptor}</p>
              {f.publisher ? (
                <p className={styles.meta}>
                  {f.publisher}
                  {f.edition ? `, ${f.edition}` : ''}
                </p>
              ) : null}
              {f.sources.length > 0 ? (
                <ul className={styles.sources}>
                  {f.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.label}
                        {data.newTabLabel ? (
                          <span className="sr-only"> {data.newTabLabel}</span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
        {data.caption ? <p className={styles.caption}>{data.caption}</p> : null}
      </div>
    </Section>
  );
}
