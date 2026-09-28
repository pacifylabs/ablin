import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Manrope } from 'next/font/google';
import { config } from '@/lib/config';
import { site } from '@/lib/site';
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

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: `${site.name} — Governance, Risk & Compliance Advisory`,
    template: `%s | ${site.name}`,
  },
  description:
    'Ablin Limited is a UK governance, risk, compliance and technology advisory firm helping organisations manage regulatory, information security, data and AI risk.',
  openGraph: { siteName: site.name, locale: 'en_GB', type: 'website' },
};

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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
