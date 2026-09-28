import { Section } from '../Section';
import type { BlockProps } from './types';
import styles from './MissionVision.module.css';

export function MissionVision({ block }: BlockProps<'missionVision'>) {
  const { data } = block;
  return (
    <Section
      anchorId={block.anchorId}
      background={block.background}
      label={`${data.mission.title}, ${data.vision.title}`}
    >
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        <div className={styles.pair}>
          {[data.mission, data.vision].map((item) => (
            <article key={item.title} className={styles.item}>
              <h2 className="h2">{item.title}</h2>
              <p className="lead">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
