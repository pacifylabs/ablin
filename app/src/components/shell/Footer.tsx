import Link from 'next/link';
import type { FooterSettings, SiteSettings } from '@/cms/globals/schemas';
import type { Link as NavLink } from '@/cms/fields';
import type { Framework } from '@/content/schema';
import { Logo } from '@/components/ui/Logo';
import { FrameworkSlider } from './FrameworkSlider';
import styles from './shell.module.css';

interface FooterProps {
  footer: FooterSettings;
  site: SiteSettings;
  services: readonly NavLink[];
  frameworks: readonly Framework[];
}

/**
 * DS v3 §7.13: brand column, up to three link columns, a Legal column, then copyright and region. The frameworks
 * strip (client request) sits between the columns and the base row when enabled in `settings:footer` and the list
 * is not empty.
 */
export function Footer({ footer, site, services, frameworks }: FooterProps) {
  const columnCount = footer.columns.length + 1;
  const copyright = footer.copyright.replaceAll('{year}', String(new Date().getFullYear()));

  return (
    <footer className={styles.footer}>
      <div
        className={`wrap ${styles.foot}`}
        style={{ '--cols': columnCount } as React.CSSProperties}
      >
        <div className={styles.footBrand}>
          <Link href="/" aria-label={site.siteName}>
            <Logo logo={{ light: site.logoLight, dark: site.logoDark, alt: '' }} />
          </Link>
          <p className={styles.footTagline}>{site.tagline}</p>
          <p>{footer.description}</p>
        </div>

        {footer.columns.map((column, index) => {
          const links = column.source === 'services' ? services : column.links;
          const id = `footer-col-${index}`;
          return (
            <nav key={id} aria-labelledby={id}>
              <h2 id={id} className={styles.footHeading}>
                {column.title}
              </h2>
              <ul className={styles.footList}>
                {links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          );
        })}

        <nav aria-labelledby="footer-legal">
          <h2 id="footer-legal" className={styles.footHeading}>
            {footer.legalTitle}
          </h2>
          <ul className={styles.footList}>
            {footer.legalLinks.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {footer.showFrameworks && frameworks.length > 0 ? (
        <div className={`wrap ${styles.footFrameworks}`}>
          <FrameworkSlider
            items={frameworks}
            title={footer.frameworksLabel}
            note={footer.frameworksNote}
            ariaLabel={footer.frameworksAriaLabel}
          />
        </div>
      ) : null}

      <div className="wrap">
        <div className={styles.footBase}>
          <span>{copyright}</span>
          <span>{footer.region}</span>
        </div>
      </div>
    </footer>
  );
}
