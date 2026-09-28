import Link from 'next/link';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './CtaBand.module.css';

export function CtaBand({ block }: BlockProps<'ctaBand'>) {
  const { data } = block;
  const titleId = `${block.id}-title`;
  const onBand = block.background === 'band';
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <h2 id={titleId} className="h2">
            {data.title}
          </h2>
          {data.text ? <p className="lead">{data.text}</p> : null}
        </div>
        <div className={styles.actions}>
          <Link href={data.primary.href} className={onBand ? 'btn btn-white' : 'btn btn-primary'}>
            {data.primary.label}
          </Link>
          {data.secondary ? (
            <Link
              href={data.secondary.href}
              className={onBand ? 'btn btn-ghost-white' : 'btn btn-line'}
            >
              {data.secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
