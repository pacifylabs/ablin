import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { getAvailability } from '@/cms/store';
import { site } from '@/lib/site';
import styles from '../status.module.css';

export const metadata: Metadata = { title: 'Site unavailable', robots: { index: false } };

const COPY = {
  coming_soon: {
    title: 'Something new is on the way',
    fallback: `${site.name} is preparing a new site. Please check back soon.`,
  },
  under_construction: {
    title: 'Scheduled maintenance',
    fallback: `${site.name} is temporarily offline for maintenance. Please check back shortly.`,
  },
} as const;

/**
 * What middleware rewrites every public path to while settings:availability.mode is not "live" (see
 * src/middleware.ts). Reads the availability doc itself for the mode and message rather than trusting the URL,
 * so the message is always current. A direct visit while the site is live 404s — this page has no purpose then.
 */
export default async function StatusPage() {
  const availability = await getAvailability();
  const mode = availability?.mode ?? 'live';
  if (mode === 'live') notFound();

  const copy = COPY[mode];
  const message = availability?.message?.trim() || copy.fallback;

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <Logo priority className={styles.logo} />
        <h1>{copy.title}</h1>
        <p className={`lead ${styles.message}`}>{message}</p>
        <div className={styles.toggle}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
