import styles from './Heading.module.css';

interface HeadingProps {
  id: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  /** Heading level: page headers use h1, everything else h2. */
  level?: 1 | 2;
  className?: string;
}

/** Eyebrow + heading + lead, the block heading used across the palette (DS v3 §3). Empty parts render nothing. */
export function Heading({ id, eyebrow, title, lead, level = 2, className }: HeadingProps) {
  const H = level === 1 ? 'h1' : 'h2';
  return (
    <div className={`${styles.heading}${className ? ` ${className}` : ''}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? (
        <H id={id} className={level === 2 ? 'h2' : undefined}>
          {title}
        </H>
      ) : null}
      {lead ? <p className="lead">{lead}</p> : null}
    </div>
  );
}
