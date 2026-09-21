/** Typed access to environment configuration. Nothing else reads process.env. */
export const config = {
  siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
  /** Base URL of the NestJS endpoint that persists and notifies contact enquiries (PRD §12). Unset until that API exists. */
  contactApiUrl: process.env.CONTACT_API_URL ?? '',
  contactApiToken: process.env.CONTACT_API_TOKEN ?? '',
} as const;
