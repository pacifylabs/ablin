import Link from 'next/link';
import type { ErrorSettings } from '@/cms/globals/schemas';
import { Button } from '@/components/ui/Button';
import styles from './errors.module.css';

/**
 * The "page not found" body, without any surrounding chrome, from `settings:errors.notFound`. Used by both
 * `(site)/not-found.tsx` and the root `not-found.tsx` so the copy can't drift between them.
 */
export function NotFoundContent({ copy }: { copy: ErrorSettings['notFound'] }) {
  return (
    <section className="section">
      <div className={`wrap container-narrow ${styles.stack}`}>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.text}</p>
        {copy.links.length > 0 ? (
          <nav aria-labelledby="not-found-links">
            <h2 id="not-found-links" className={styles.linksTitle}>
              {copy.linksTitle}
            </h2>
            <ul className={styles.links}>
              {copy.links.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link href={item.href} className="link-quiet">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <div>
          <Button href={copy.cta.href} variant="line">
            {copy.cta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
