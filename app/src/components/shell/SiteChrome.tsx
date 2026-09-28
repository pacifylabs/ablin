import { getFrameworks, withMarks } from '@/cms/collections/frameworks';
import { listServices, serviceHref } from '@/cms/collections/services';
import {
  getCookieSettings,
  getFooterSettings,
  getNavigation,
  getSiteSettings,
} from '@/cms/globals';
import { PreviewBanner } from '@/admin/ui/PreviewBanner';
import { config } from '@/lib/config';
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
    listServices(),
    getFrameworks().then(withMarks),
  ]);
  const logo = { light: site.logoLight, dark: site.logoDark, alt: site.logoAlt };

  return (
    <>
      <SkipLink label={nav.labels.skipLink} />
      <PreviewBanner />
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
      <CookieBanner copy={cookies} ga4Id={cookies.ga4Id || config.analytics.gaMeasurementId} />
    </>
  );
}
