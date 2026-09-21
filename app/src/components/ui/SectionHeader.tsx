interface SectionHeaderProps {
  id: string;
  kicker?: string;
  title: string;
  lead?: string;
  /** Feature-block variant renders on navy and sets its own text colours. */
  className?: string;
  /** Two-column header on wide screens: title left, lead right. */
  split?: boolean;
}

export function SectionHeader({ id, kicker, title, lead, className, split }: SectionHeaderProps) {
  return (
    <header
      className={`section-header${split ? ' section-header-split' : ''}${className ? ` ${className}` : ''}`}
    >
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h2 id={id}>{title}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </header>
  );
}
