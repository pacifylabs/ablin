import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Source_Serif_4 } from 'next/font/google';
import { config } from '@/lib/config';
import { site } from '@/lib/site';
import { themeInitScript } from '@/lib/theme';
import './globals.css';
import '@/styles/patterns.css';
import '@/styles/texture.css';
import '@/styles/motion.css';

const serif = Source_Serif_4({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
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
    { media: '(prefers-color-scheme: dark)', color: '#0c1420' },
  ],
};

/**
 * `<html>`, fonts and the theme script only — no header/footer/nav. Those are added by each top-level route
 * group's own layout (see `(site)/layout.tsx`, `(admin)/layout.tsx`, `(gate)/layout.tsx`) so the admin
 * dashboard and the availability-gate pages don't inherit the public site's chrome.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
