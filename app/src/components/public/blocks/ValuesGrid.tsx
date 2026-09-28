import { Heading } from '../Heading';
import { LineIcon } from '../LineIcon';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './ValuesGrid.module.css';

export function ValuesGrid({ block }: BlockProps<'valuesGrid'>) {
  const { data } = block;
  const titleId = `${block.id}-title`;
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className="wrap">
        <Heading
          id={titleId}
          eyebrow={data.eyebrow}
          title={data.title}
          lead={data.lead}
          className={styles.head}
        />
        <ul className={styles.grid}>
          {data.items.map((item) => (
            <li key={item.title}>
              <LineIcon name={item.icon} className={styles.icon} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
