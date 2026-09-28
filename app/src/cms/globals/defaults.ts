import type {
  ContactSettings,
  CookieSettings,
  ErrorSettings,
  FooterSettings,
  NavigationSettings,
  SeoSettings,
  SiteSettings,
} from './schemas';

/**
 * Seed values for the globals — the site's current live copy. Used by `pnpm seed` for a key that does not exist yet,
 * and served by the public getters only if Redis is unreachable or a stored value fails validation. Components never
 * import this file.
 */

export const defaultSite: SiteSettings = {
  siteName: 'Ablin Limited',
  tagline: 'Secure · Scalable · Smart IT Consulting',
  logoLight: '/image/logo-wordmark-light.png',
  logoDark: '/image/logo-wordmark-dark.png',
  logoAlt: 'Ablin Limited logo',
  favicon: '/icon.png',
  defaultTheme: 'system',
  siteUrl: '',
  locale: 'en-GB',
};

const primary = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Who We Serve', href: '/who-we-serve' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

export const defaultNavigation: NavigationSettings = {
  items: primary,
  cta: { label: 'Speak to Our Consultants', href: '/contact' },
  labels: {
    skipLink: 'Skip to main content',
    primaryNav: 'Primary',
    mobileNav: 'Mobile primary',
    breadcrumb: 'Breadcrumb',
    home: 'Ablin Limited home',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    themeToggle: 'Switch colour theme',
    themeToLight: 'Switch to light theme',
    themeToDark: 'Switch to dark theme',
  },
};

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'Accessibility', href: '/accessibility' },
];

export const defaultFooter: FooterSettings = {
  description:
    'Governance, risk, compliance and technology advisory for organisations navigating regulation, data and emerging technology.',
  columns: [
    {
      title: 'Company',
      source: 'manual',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Who We Serve', href: '/who-we-serve' },
        { label: 'Insights', href: '/insights' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    { title: 'Services', source: 'services', links: [] },
  ],
  legalTitle: 'Legal',
  legalLinks,
  copyright: '© {year} Ablin Limited. All rights reserved.',
  region: 'United Kingdom',
  showFrameworks: true,
  frameworksLabel: 'Frameworks we advise on',
  frameworksNote: 'Advisory and readiness support only. We do not issue certificates.',
  frameworksAriaLabel: 'Frameworks list, scrolling. Hover or focus to pause.',
};

export const defaultSeo: SeoSettings = {
  titleTemplate: '%s | Ablin Limited',
  defaultTitle: 'Ablin Limited — Governance, Risk & Compliance Advisory',
  defaultDescription:
    'Ablin Limited is a UK governance, risk, compliance and technology advisory firm helping organisations manage regulatory, information security, data and AI risk.',
  ogImage: '/image/og-default.png',
  ogImageAlt: 'Ablin Limited: Secure, Scalable, Smart IT Consulting',
  organization: {
    name: 'Ablin Limited',
    legalName: 'Ablin Limited',
    description: 'Governance, risk, compliance and technology advisory.',
    logo: '/image/logo-lockup-light.png',
    email: '',
    areaServed: 'GB',
    sameAs: [],
  },
  searchConsoleVerification: '',
};

export const defaultContact: ContactSettings = {
  enquiryTypes: [
    { value: 'grc', label: 'Governance, risk and compliance' },
    { value: 'iso', label: 'ISO and compliance readiness' },
    { value: 'data-protection', label: 'Data protection and privacy' },
    { value: 'ai-governance', label: 'AI governance' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'soc2', label: 'SOC 2' },
    { value: 'general', label: 'General enquiry' },
  ],
  recipients: [],
  fields: {
    fullName: { label: 'Full name', placeholder: 'e.g. Jane Doe' },
    email: { label: 'Work email', placeholder: 'you@company.com' },
    organisation: { label: 'Organisation', placeholder: 'e.g. Acme Ltd' },
    enquiryType: { label: 'Enquiry type', placeholder: 'Select an enquiry type' },
    message: {
      label: 'How can we help?',
      placeholder: 'Tell us about your organisation and what you need.',
    },
  },
  consentText: 'I agree to Ablin Limited processing this enquiry in line with the',
  consentLinkLabel: 'Privacy Policy',
  consentLinkHref: '/privacy-policy',
  requiredMark: '(required)',
  optionalMark: '(optional)',
  honeypotLabel: 'Leave this field empty',
  submitLabel: 'Request a Consultation',
  sendingLabel: 'Sending message',
  successTitle: 'Message sent',
  successMessage: 'Thank you. A consultant will read your message and reply to {email}.',
  anotherLabel: 'Send another message',
  errors: {
    fullName: 'Enter your full name.',
    email: 'Enter a valid work email so we can reply.',
    enquiryType: 'Choose an enquiry type.',
    message: 'Tell us a little more, at least 20 characters.',
    consent: 'Tick the box to confirm you agree.',
    tooLong: 'This is too long. Shorten it and try again.',
    summary: 'Check the fields marked below and try again.',
    rateLimited:
      'Too many messages were sent from your connection. Wait a few minutes and try again.',
    unavailable: 'We could not send your message. Try again in a few minutes.',
    generic: 'We could not send your message. Try again in a few minutes.',
  },
  autoReply: { enabled: false, subject: '', body: '' },
};

export const defaultCookies: CookieSettings = {
  ga4Id: '',
  title: 'Cookies on this site',
  body: 'We use essential cookies to make this site work. With your permission we would also like to use analytics cookies to understand how the site is used.',
  policyLink: { label: 'Cookie Policy', href: '/cookie-policy' },
  acceptLabel: 'Accept analytics',
  rejectLabel: 'Reject analytics',
  preferencesLabel: 'Preferences',
  preferencesTitle: 'Cookie preferences',
  necessaryTitle: 'Essential cookies',
  necessaryText: 'Needed for the site to work, such as remembering your theme. Always on.',
  analyticsTitle: 'Analytics cookies',
  analyticsText: 'Help us understand which pages are useful. Off unless you turn them on.',
  saveLabel: 'Save preferences',
};

export const defaultErrors: ErrorSettings = {
  notFound: {
    title: 'This page can’t be found',
    text: 'The address may be wrong or the page may have moved. Try one of these instead.',
    linksTitle: 'Popular pages',
    links: primary,
    cta: { label: 'Speak to Our Consultants', href: '/contact' },
  },
  serverError: {
    title: 'Something went wrong',
    text: 'The page could not be loaded. Try again, or contact us if the problem continues.',
    retryLabel: 'Try again',
    cta: { label: 'Speak to Our Consultants', href: '/contact' },
  },
};

/** Gate copy used when `settings:availability` has none for the active mode. */
export const defaultAvailabilityCopy = {
  comingSoon: {
    headline: 'Something new is on the way',
    message: 'Ablin Limited is preparing a new site. Please check back soon.',
    contactLine: '',
  },
  underConstruction: {
    headline: 'Scheduled maintenance',
    message: 'Ablin Limited is temporarily offline for maintenance. Please check back shortly.',
    contactLine: '',
  },
} as const;
