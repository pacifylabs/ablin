/**
 * Structural site constants: brand, navigation and legal links. Page copy lives in src/content and is
 * read through lib/content.ts.
 */

export const site = {
  name: 'Ablin Limited',
  tagline: 'Secure · Scalable · Smart IT Consulting',
  positioning: 'Governance, risk, compliance and technology advisory.',
  region: 'United Kingdom',
} as const;

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export const primaryNav: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Who We Serve', href: '/who-we-serve' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

export const headerCta: NavItem = { label: 'Speak to our consultants', href: '/contact' };

export const companyNav: readonly NavItem[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Who We Serve', href: '/who-we-serve' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

export const legalNav: readonly NavItem[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'Accessibility', href: '/accessibility' },
];
