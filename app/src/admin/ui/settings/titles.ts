import type { GlobalName } from '@/cms/globals';

export const GLOBAL_TITLES: Record<GlobalName, { title: string; lead: string }> = {
  site: {
    title: 'Site',
    lead: 'Name, tagline, logo, favicon, default theme and the public site address.',
  },
  navigation: {
    title: 'Navigation',
    lead: 'Header links, the header button and screen-reader labels.',
  },
  footer: {
    title: 'Footer',
    lead: 'Footer description, link columns, legal links, frameworks strip and bottom row.',
  },
  seo: {
    title: 'Search and sharing',
    lead: 'Default titles, descriptions, share image and organisation details.',
  },
  contact: {
    title: 'Contact form',
    lead: 'Enquiry types, recipients, field labels, messages and the acknowledgement email.',
  },
  cookies: {
    title: 'Cookies and analytics',
    lead: 'The GA4 ID and every line of the cookie banner.',
  },
  errors: { title: 'Error pages', lead: 'The page-not-found and something-went-wrong pages.' },
};
