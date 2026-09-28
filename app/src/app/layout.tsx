import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Manrope } from 'next/font/google';
import { getErrorSettings, getSeoSettings, getSiteSettings } from '@/cms/globals';
import { absoluteUrl, getSiteUrl } from '@/cms/site-meta';
import { ErrorCopyProvider } from '@/components/shell/ErrorCopy';
import { themeInitScript } from '@/lib/theme';
import './globals.css';
import '@/styles/motion.css';

const display = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const body = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

/** Site-wide defaults from `settings:site` and `settings:seo`; each page overrides title, description and canonical. */
export async function generateMetadata(): Promise<Metadata> {
  const [site, seo, siteUrl] = await Promise.all([
    getSiteSettings(),
    getSeoSettings(),
    getSiteUrl(),
  ]);
  const ogImage = seo.ogImage
    ? [{ url: absoluteUrl(siteUrl, seo.ogImage), alt: seo.ogImageAlt || undefined }]
    : undefined;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    icons: { icon: site.favicon, apple: site.favicon },
    openGraph: {
      siteName: site.siteName,
      locale: site.locale.replace('-', '_'),
      type: 'website',
      images: ogImage,
    },
    twitter: { card: 'summary_large_image', images: ogImage },
    ...(seo.searchConsoleVerification
      ? { verification: { google: seo.searchConsoleVerification } }
      : {}),
  };
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1626' },
  ],
};

/**
 * `<html>`, fonts and the theme script only — no header/footer/nav. Those are added by each top-level route
 * group's own layout (see `(site)/layout.tsx`, `(admin)/layout.tsx`, `(gate)/layout.tsx`) so the admin
 * dashboard and the availability-gate pages don't inherit the public site's chrome.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, errors] = await Promise.all([getSiteSettings(), getErrorSettings()]);
  return (
    <html
      lang={site.locale}
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript(site.defaultTheme) }} />
      </head>
      <body>
        <ErrorCopyProvider copy={errors.serverError}>{children}</ErrorCopyProvider>
      </body>
    </html>
  );
}
