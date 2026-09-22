import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { config } from '@/lib/config';
import { defaultSiteDescription, rootOpenGraph, rootTwitter } from '@/lib/seo';
import { site } from '@/lib/site';
import { themeInitScript } from '@/lib/theme';
import './globals.css';
import '@/styles/patterns.css';
import '@/styles/texture.css';
import '@/styles/motion.css';

/** Geometric sans aligned with the ABLIN wordmark (see public/image/logo-wordmark-*.png). */
const brand = Montserrat({
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: `${site.name} — Governance, Risk & Compliance Advisory`,
    template: `%s | ${site.name}`,
  },
  description: defaultSiteDescription,
  openGraph: rootOpenGraph,
  twitter: rootTwitter,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
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
    <html lang="en-GB" className={brand.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
