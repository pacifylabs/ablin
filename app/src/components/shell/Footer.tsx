import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { getFrameworks, getServices, serviceHref } from '@/lib/content';
import { companyNav, legalNav, site } from '@/lib/site';
import { FrameworkSlider } from './FrameworkSlider';
import styles from './shell.module.css';

/**
 * Footer in four bands, after the Rakuxon footers: columns of similar length share a band, so no single column sets
 * the row height and leaves an empty pocket beside it.
 *   1. Brand and the one call to action.
 *   2. Link columns (Company, Services in two columns, Legal), each about four rows tall.
 *   3. The frameworks strip, full width.
 *   4. Region and copyright.
 */
export async function Footer() {
  const [services, frameworks] = await Promise.all([getServices(), getFrameworks()]);

  return (
    <footer className={`${styles.footer} on-navy`}>
      <div className="container">
        <div className={styles.bandBrand}>
          <div className={styles.brandBlock}>
            <Logo tone="onDark" className={styles.footerLogo} />
            <p className={styles.footerTagline}>{site.tagline}</p>
            <p>{site.positioning}</p>
          </div>
          <div className={styles.ctaBlock}>
            <p className={styles.footerHeading}>Talk to us</p>
            <Link href="/contact" className={styles.footerCta}>
              Speak to our consultants
            </Link>
          </div>
        </div>

        <div className={styles.bandLinks}>
          <nav className={styles.colCompany} aria-labelledby="footer-company">
            <h2 id="footer-company" className={styles.footerHeading}>
              Company
            </h2>
            <ul className={styles.footerList}>
              {companyNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.colServices} aria-labelledby="footer-services">
            <h2 id="footer-services" className={styles.footerHeading}>
              Services
            </h2>
            <ul className={`${styles.footerList} ${styles.servicesList}`}>
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={serviceHref(service.slug)}>{service.title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.colLegal} aria-labelledby="footer-legal">
            <h2 id="footer-legal" className={styles.footerHeading}>
              Legal
            </h2>
            <ul className={styles.footerList}>
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bandFrameworks}>
          <FrameworkSlider items={frameworks} />
        </div>

        <div className={styles.footerBase}>
          <p>{site.region}</p>
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
