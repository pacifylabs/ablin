import type { BlockOf } from '@/cms/blocks';
import { resolveImage } from '@/cms/collections/media';
import { Photo } from '../Photo';
import { Heading } from '../Heading';
import { Section } from '../Section';
import styles from './AboutIntro.module.css';

interface AboutIntroProps {
  block: BlockOf<'aboutIntro'>;
  /** A factStrip placed directly after this block; rendered beside it (DS v3 §7.5). */
  facts?: BlockOf<'factStrip'> | null;
}

export async function AboutIntro({ block, facts }: AboutIntroProps) {
  const { data } = block;
  const titleId = `${block.id}-title`;
  const showFacts = facts && facts.visible && facts.data.approvedByClient;
  const image = showFacts ? null : await resolveImage(data.image);
  return (
    <Section anchorId={block.anchorId} background={block.background} labelledBy={titleId}>
      <div className={`wrap ${showFacts || image ? styles.split : ''}`}>
        <div className={styles.intro}>
          <Heading id={titleId} eyebrow={data.eyebrow} title={data.title} />
          {data.paragraphs.map((p, i) => (
            <p key={i} className="lead">
              {p}
            </p>
          ))}
        </div>
        {showFacts ? <FactList facts={facts.data.facts} /> : null}
        {image ? (
          <div className={styles.photo}>
            <Photo image={image} fill sizes="(max-width: 1000px) 100vw, 520px" />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

export function FactList({ facts }: { facts: BlockOf<'factStrip'>['data']['facts'] }) {
  return (
    <dl className={styles.facts}>
      {facts.map((fact) => (
        <div key={fact.label} className={styles.fact}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A factStrip on its own (not paired): renders only when the client has approved the numbers. */
export function FactStrip({ block }: { block: BlockOf<'factStrip'> }) {
  if (!block.data.approvedByClient) return null;
  return (
    <Section anchorId={block.anchorId} background={block.background} pad="tight">
      <div className="wrap">
        <FactList facts={block.data.facts} />
      </div>
    </Section>
  );
}
