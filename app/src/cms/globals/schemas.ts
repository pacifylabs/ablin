import { z } from 'zod';
import { DEFAULT_THEMES } from '@/lib/theme';
import {
  emailSchema,
  hrefSchema,
  imageUrlSchema,
  linkSchema,
  optionalTextSchema,
  textSchema,
} from '../fields';

/**
 * The seven site-wide singletons (DS v3 §9). Every visible string in the header, footer, cookie banner, error pages,
 * contact form and default metadata comes from one of these; components receive them as props.
 */

const siteUrlSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^https:\/\/[^/]+$/.test(v.replace(/\/$/, '')),
    'Use the public origin, e.g. https://ablinlimited.com (leave empty to use the hosting domain)',
  )
  .transform((v) => v.replace(/\/$/, ''));

export const siteSettingsSchema = z.object({
  siteName: textSchema,
  tagline: textSchema,
  /** Shown on light surfaces (light theme header). */
  logoLight: imageUrlSchema,
  /** Shown on dark surfaces (dark theme header, navy hero, footer band). */
  logoDark: imageUrlSchema,
  logoAlt: textSchema,
  favicon: imageUrlSchema,
  defaultTheme: z.enum(DEFAULT_THEMES),
  /** Public origin for canonical, Open Graph and sitemap. Empty = the hosting platform's production domain. */
  siteUrl: siteUrlSchema,
  locale: z
    .string()
    .trim()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Use a locale such as en-GB'),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const navigationSettingsSchema = z.object({
  items: z.array(linkSchema).min(1).max(8),
  cta: linkSchema,
  /** Accessible names for icon-only and landmark controls; visible to assistive technology only. */
  labels: z.object({
    skipLink: textSchema,
    primaryNav: textSchema,
    mobileNav: textSchema,
    home: textSchema,
    openMenu: textSchema,
    closeMenu: textSchema,
    themeToggle: textSchema,
    themeToLight: textSchema,
    themeToDark: textSchema,
  }),
});
export type NavigationSettings = z.infer<typeof navigationSettingsSchema>;

const footerColumnSchema = z.object({
  title: textSchema,
  /** `services` lists the services collection automatically; `manual` uses `links`. */
  source: z.enum(['manual', 'services']),
  links: z.array(linkSchema),
});

export const footerSettingsSchema = z.object({
  description: textSchema,
  columns: z.array(footerColumnSchema).min(1).max(3),
  legalTitle: textSchema,
  legalLinks: z.array(linkSchema),
  /** `{year}` is replaced with the current year. */
  copyright: textSchema,
  region: textSchema,
  showFrameworks: z.boolean(),
  frameworksLabel: textSchema,
  frameworksNote: optionalTextSchema,
  /** Accessible name of the scrolling strip. */
  frameworksAriaLabel: textSchema,
});
export type FooterSettings = z.infer<typeof footerSettingsSchema>;

export const seoSettingsSchema = z.object({
  /** `%s` is replaced with the page's own title. */
  titleTemplate: textSchema.refine((v) => v.includes('%s'), 'Must contain %s'),
  defaultTitle: textSchema,
  defaultDescription: textSchema,
  ogImage: imageUrlSchema.or(z.literal('')),
  ogImageAlt: optionalTextSchema,
  organization: z.object({
    name: textSchema,
    legalName: optionalTextSchema,
    description: optionalTextSchema,
    logo: imageUrlSchema.or(z.literal('')),
    email: emailSchema.or(z.literal('')),
    areaServed: optionalTextSchema,
    sameAs: z.array(hrefSchema),
  }),
  searchConsoleVerification: optionalTextSchema,
});
export type SeoSettings = z.infer<typeof seoSettingsSchema>;

const formFieldCopySchema = z.object({ label: textSchema, placeholder: optionalTextSchema });

export const contactSettingsSchema = z.object({
  enquiryTypes: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens'),
        label: textSchema,
      }),
    )
    .min(1),
  /** Inboxes that receive enquiries. Empty = the CONTACT_TO_EMAIL environment variable. */
  recipients: z.array(emailSchema),
  fields: z.object({
    fullName: formFieldCopySchema,
    email: formFieldCopySchema,
    organisation: formFieldCopySchema,
    enquiryType: formFieldCopySchema,
    message: formFieldCopySchema,
  }),
  consentText: textSchema,
  consentLinkLabel: optionalTextSchema,
  consentLinkHref: hrefSchema.or(z.literal('')),
  requiredMark: textSchema,
  optionalMark: textSchema,
  honeypotLabel: textSchema,
  submitLabel: textSchema,
  sendingLabel: textSchema,
  successTitle: textSchema,
  /** `{email}` is replaced with the address the visitor entered. */
  successMessage: textSchema,
  anotherLabel: textSchema,
  errors: z.object({
    fullName: textSchema,
    email: textSchema,
    enquiryType: textSchema,
    message: textSchema,
    consent: textSchema,
    tooLong: textSchema,
    summary: textSchema,
    rateLimited: textSchema,
    unavailable: textSchema,
    generic: textSchema,
  }),
  autoReply: z.object({
    enabled: z.boolean(),
    subject: optionalTextSchema,
    body: optionalTextSchema,
  }),
});
export type ContactSettings = z.infer<typeof contactSettingsSchema>;

/** The part of `settings:contact` the browser may see; recipients and the auto-reply stay on the server. */
export type ContactFormCopy = Omit<ContactSettings, 'recipients' | 'autoReply'>;

export function toContactFormCopy(settings: ContactSettings): ContactFormCopy {
  const copy: Partial<ContactSettings> = { ...settings };
  delete copy.recipients;
  delete copy.autoReply;
  return copy as ContactFormCopy;
}

export const cookieSettingsSchema = z.object({
  /** GA4 measurement ID (G-XXXX). Empty = no analytics, so no banner is needed and none is shown. */
  ga4Id: z
    .string()
    .trim()
    .refine((v) => v === '' || /^G-[A-Z0-9]{4,}$/.test(v), 'Use a GA4 ID such as G-ABC123'),
  title: textSchema,
  body: textSchema,
  policyLink: linkSchema,
  acceptLabel: textSchema,
  rejectLabel: textSchema,
  preferencesLabel: textSchema,
  preferencesTitle: textSchema,
  necessaryTitle: textSchema,
  necessaryText: textSchema,
  analyticsTitle: textSchema,
  analyticsText: textSchema,
  saveLabel: textSchema,
});
export type CookieSettings = z.infer<typeof cookieSettingsSchema>;

export const errorSettingsSchema = z.object({
  notFound: z.object({
    title: textSchema,
    text: textSchema,
    linksTitle: textSchema,
    links: z.array(linkSchema),
    cta: linkSchema,
  }),
  serverError: z.object({
    title: textSchema,
    text: textSchema,
    retryLabel: textSchema,
    cta: linkSchema,
  }),
});
export type ErrorSettings = z.infer<typeof errorSettingsSchema>;
