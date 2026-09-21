import type { LegalPage } from '@/content/schema';
import styles from './blocks.module.css';

export function LegalDocument({ page }: { page: LegalPage }) {
  return (
    <section className="section" aria-labelledby="page-title">
      <div
        className="container container-narrow"
        style={{ display: 'grid', gap: 'var(--space-8)' }}
      >
        <header style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <h1 id="page-title">{page.title}</h1>
          <p className="lead">{page.lead}</p>
          <p className="small muted">Last updated {page.updated}</p>
          {page.reviewStatus === 'draft' ? (
            <p className={styles.notice} role="note">
              This text is a draft and is awaiting review by Ablin Limited. It should not be relied
              on as final.
            </p>
          ) : null}
        </header>
        <div className={styles.legal}>
          {page.sections.map((section) => (
            <section key={section.heading} className={styles.legalSection}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list.length > 0 ? (
                <ul className="check-list">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
