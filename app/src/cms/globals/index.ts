import { cache } from 'react';
import { z } from 'zod';
import { readCached } from '../cached';
import { keys } from '../keys';
import {
  defaultContact,
  defaultCookies,
  defaultErrors,
  defaultFooter,
  defaultNavigation,
  defaultSeo,
  defaultSite,
} from './defaults';
import {
  contactSettingsSchema,
  cookieSettingsSchema,
  errorSettingsSchema,
  footerSettingsSchema,
  navigationSettingsSchema,
  seoSettingsSchema,
  siteSettingsSchema,
} from './schemas';

export * from './schemas';

/**
 * One entry per singleton: its Redis key, schema and seed default. The admin settings API, the seed script and the
 * public getters below all read from this table, so the three can never disagree about a global's shape.
 */
export const GLOBALS = {
  site: { key: keys.settings.site, schema: siteSettingsSchema, seed: defaultSite },
  navigation: {
    key: keys.settings.navigation,
    schema: navigationSettingsSchema,
    seed: defaultNavigation,
  },
  footer: { key: keys.settings.footer, schema: footerSettingsSchema, seed: defaultFooter },
  seo: { key: keys.settings.seo, schema: seoSettingsSchema, seed: defaultSeo },
  contact: { key: keys.settings.contact, schema: contactSettingsSchema, seed: defaultContact },
  cookies: { key: keys.settings.cookies, schema: cookieSettingsSchema, seed: defaultCookies },
  errors: { key: keys.settings.errors, schema: errorSettingsSchema, seed: defaultErrors },
} as const;

export type GlobalName = keyof typeof GLOBALS;
export const GLOBAL_NAMES = Object.keys(GLOBALS) as GlobalName[];
export type GlobalValue<N extends GlobalName> = z.infer<(typeof GLOBALS)[N]['schema']>;

export function isGlobalName(value: string): value is GlobalName {
  return Object.hasOwn(GLOBALS, value);
}

export const getSiteSettings = cache(() =>
  readCached(GLOBALS.site.key, GLOBALS.site.schema, GLOBALS.site.seed),
);
export const getNavigation = cache(() =>
  readCached(GLOBALS.navigation.key, GLOBALS.navigation.schema, GLOBALS.navigation.seed),
);
export const getFooterSettings = cache(() =>
  readCached(GLOBALS.footer.key, GLOBALS.footer.schema, GLOBALS.footer.seed),
);
export const getSeoSettings = cache(() =>
  readCached(GLOBALS.seo.key, GLOBALS.seo.schema, GLOBALS.seo.seed),
);
export const getContactSettings = cache(() =>
  readCached(GLOBALS.contact.key, GLOBALS.contact.schema, GLOBALS.contact.seed),
);
export const getCookieSettings = cache(() =>
  readCached(GLOBALS.cookies.key, GLOBALS.cookies.schema, GLOBALS.cookies.seed),
);
export const getErrorSettings = cache(() =>
  readCached(GLOBALS.errors.key, GLOBALS.errors.schema, GLOBALS.errors.seed),
);
