import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { primaryNav } from '@/lib/site';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
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
