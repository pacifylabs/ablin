import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { primaryNav } from '@/lib/site';

/**
 * The "page not found" body, without any surrounding chrome. Used from two places that need it wrapped
 * differently — see `(site)/not-found.tsx` and the root `not-found.tsx` — so the copy can't drift between them.
 */
export function NotFoundContent() {
  return (
    <section className="section">
      <div
        className="container container-narrow"
        style={{ display: 'grid', gap: 'var(--space-6)' }}
      >
        <h1>This page can&rsquo;t be found</h1>
        <p className="lead">
          The address may be wrong or the page may have moved. Try one of these instead.
        </p>
        <ul style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="link-quiet">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div>
          <Button href="/contact" variant="ghost">
            Speak to our consultants
          </Button>
        </div>
      </div>
    </section>
  );
}
