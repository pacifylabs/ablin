import { Heading } from '../Heading';
import { Section } from '../Section';
import { Steps } from './Steps';
import type { BlockProps } from './types';
import styles from './ApproachSteps.module.css';

export function ApproachSteps({ block }: BlockProps<'approachSteps'>) {
  const { data } = block;
  const titleId = `${block.id}-title`;
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className={`wrap ${styles.layout}`}>
        <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} lead={data.lead} />
        <Steps steps={data.steps} compact={data.compact} />
      </div>
    </Section>
  );
}
