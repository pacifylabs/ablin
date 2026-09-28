import { Heading } from '../Heading';
import { LineIcon } from '../LineIcon';
import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './WhyGrid.module.css';

/** DS v3 §7.10: 3×2 hairline grid; the first cell is the heading block on --surface. */
export function WhyGrid({ block }: BlockProps<'whyGrid'>) {
  const { data } = block;
  const titleId = `${block.id}-title`;
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} />
            {data.intro ? <p className={styles.introText}>{data.intro}</p> : null}
          </div>
          {data.items.map((item) => (
            <div key={item.title} className={styles.cell}>
              <LineIcon name={item.icon} className={styles.icon} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
