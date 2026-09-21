import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Source_Serif_4 } from 'next/font/google';
import { Footer } from '@/components/shell/Footer';
import { Header } from '@/components/shell/Header';
import { SkipLink } from '@/components/shell/SkipLink';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SkipLink />
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
