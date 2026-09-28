import { getFooterFrameworks } from '@/cms/frameworks-cache';
import {
  getCookieSettings,
  getFooterSettings,
  getNavigation,
  getSiteSettings,
} from '@/cms/globals';
import { getServices, serviceHref } from '@/lib/content';
import { CookieBanner } from './CookieBanner';
import { Footer } from './Footer';
import { Header } from './Header';
import { SkipLink } from './SkipLink';

/**
 * The public site's header/main/footer, pulled out of the root layout so the admin dashboard and the
 * availability-gate pages can share the root `<html>`/font/theme setup without inheriting the public nav.
 * Every string comes from the `settings:*` globals (DS v3 §9).
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [site, nav, footer, cookies, services, frameworks] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getFooterSettings(),
    getCookieSettings(),
    getServices(),
    getFooterFrameworks(),
  ]);
  const logo = { light: site.logoLight, dark: site.logoDark, alt: site.logoAlt };

  return (
    <>
      <SkipLink label={nav.labels.skipLink} />
      <Header nav={nav} logo={logo} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer
        footer={footer}
        site={site}
        services={services.map((s) => ({ label: s.title, href: serviceHref(s.slug) }))}
        frameworks={frameworks}
      />
      {cookies.ga4Id ? <CookieBanner copy={cookies} /> : null}
    </>
  );
}
