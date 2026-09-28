import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { getNavigation, getSiteSettings } from '@/cms/globals';
import { defaultAvailabilityCopy } from '@/cms/globals/defaults';
import { getAvailability } from '@/cms/store';
import type { Availability, AvailabilityCopy } from '@/cms/schema';
import styles from '../status.module.css';

function copyFor(availability: Availability | null): AvailabilityCopy | null {
  const mode = availability?.mode ?? 'live';
  if (mode === 'live') return null;
  const key = mode === 'coming_soon' ? 'comingSoon' : 'underConstruction';
  const own = availability?.[key];
  if (own) return own;
  const fallback = defaultAvailabilityCopy[key];
  const legacy = availability?.message?.trim();
  return legacy ? { ...fallback, message: legacy } : fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = copyFor(await getAvailability());
  return { title: copy?.headline, robots: { index: false } };
}

/**
 * What middleware rewrites every public path to while settings:availability.mode is not "live" (see
 * src/middleware.ts). Reads the availability doc itself for the mode and copy rather than trusting the URL, so the
 * message is always current. A direct visit while the site is live 404s — this page has no purpose then.
 */
export default async function StatusPage() {
  const [availability, site, nav] = await Promise.all([
    getAvailability(),
    getSiteSettings(),
    getNavigation(),
  ]);
  const copy = copyFor(availability);
  if (!copy) notFound();

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <Logo
          logo={{ light: site.logoLight, dark: site.logoDark, alt: site.logoAlt }}
          priority
          className={styles.logo}
        />
        <h1>{copy.headline}</h1>
        <p className={`lead ${styles.message}`}>{copy.message}</p>
        {copy.contactLine ? <p className={styles.contact}>{copy.contactLine}</p> : null}
        <div className={styles.toggle}>
          <ThemeToggle labels={nav.labels} />
        </div>
      </div>
    </div>
  );
}
