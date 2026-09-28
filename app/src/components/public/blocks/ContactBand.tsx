import { getContactSettings, toContactFormCopy } from '@/cms/globals';
import { ContactForm } from '@/components/contact/ContactForm';
import type { BlockProps } from './types';
import styles from './ContactBand.module.css';

/**
 * DS v3 §7.12: a --band panel (radius 32) inside the page, heading + sub + checklist on the left, the enquiry form
 * on the right. The faint concentric rings are CSS only. Always navy, so it sets its own section background.
 */
export async function ContactBand({ block }: BlockProps<'contactBand'>) {
  const { data } = block;
  const contact = await getContactSettings();
  const titleId = `${block.id}-title`;
  return (
    <section
      id={block.anchorId || undefined}
      data-bg={block.background}
      className={styles.section}
      aria-labelledby={titleId}
    >
      <div className="wrap">
        <div className={styles.band} data-bg="band">
          <div className={styles.copy}>
            <h2 id={titleId} className={styles.title}>
              {data.title}
            </h2>
            {data.sub ? <p className={styles.sub}>{data.sub}</p> : null}
            {data.checklist.length > 0 ? (
              <ul className={styles.checks}>
                {data.checklist.map((line) => (
                  <li key={line}>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path d="M3 8.5l3 3 7-7" />
                    </svg>
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <ContactForm copy={toContactFormCopy(contact)} />
        </div>
      </div>
    </section>
  );
}
