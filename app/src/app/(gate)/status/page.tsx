import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { HeroSignalBackground } from '@/components/hero-signal/HeroSignalBackground';
import { getSiteSettings } from '@/cms/globals';
import { defaultAvailabilityCopy } from '@/cms/globals/defaults';
import { getAvailability, getPage } from '@/cms/store';
import type { Availability, AvailabilityCopy } from '@/cms/schema';
import styles from '../status.module.css';

type GateMode = 'coming_soon' | 'under_construction';

function copyFor(
  availability: Availability | null,
): { mode: GateMode; copy: AvailabilityCopy } | null {
  const mode = availability?.mode ?? 'live';
  if (mode === 'live') return null;
  const key = mode === 'coming_soon' ? 'comingSoon' : 'underConstruction';
  const own = availability?.[key];
  if (own) return { mode, copy: own };
  const fallback = defaultAvailabilityCopy[key];
  const legacy = availability?.message?.trim();
  return { mode, copy: legacy ? { ...fallback, message: legacy } : fallback };
}

/** SEO title/description come from page:coming-soon / page:under-construction; the gate is never indexed. */
export async function generateMetadata(): Promise<Metadata> {
  const gate = copyFor(await getAvailability());
  if (!gate) return { robots: { index: false } };
  const page = await getPage(
    gate.mode === 'coming_soon' ? 'coming-soon' : 'under-construction',
  ).catch(() => null);
  return {
    title: page?.seoTitle ?? gate.copy.headline,
    description: page?.seoDescription,
    robots: { index: false },
  };
}

/**
 * What middleware rewrites every public path to while settings:availability.mode is not "live" (see
 * src/middleware.ts). DS v3 §7.14: a full-height navy frame with the lattice, the logo, headline, message and contact
 * line — all from settings:availability. A direct visit while the site is live 404s.
 */
export default async function StatusPage() {
  const [availability, site] = await Promise.all([getAvailability(), getSiteSettings()]);
  const gate = copyFor(availability);
  if (!gate) notFound();
  const { copy } = gate;

  return (
    <main className={styles.screen}>
      <div className={`${styles.frame} on-navy`}>
        <HeroSignalBackground />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.card}>
          <Logo
            logo={{ light: site.logoLight, dark: site.logoDark, alt: site.logoAlt }}
            tone="onDark"
            priority
            className={styles.logo}
          />
          <h1 className={styles.title}>{copy.headline}</h1>
          <p className={styles.message}>{copy.message}</p>
          {copy.contactLine ? <p className={styles.contact}>{copy.contactLine}</p> : null}
        </div>
      </div>
    </main>
  );
}
