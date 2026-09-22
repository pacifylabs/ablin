import { unstable_cache } from 'next/cache';
import type { Framework } from '@/content/schema';
import { getFrameworksWithFallback } from './store';

/**
 * A cached read of the frameworks list, for the footer only (rendered on every page, including
 * services/[service], which is deliberately kept statically generated — see that route's own comment). An
 * uncached Redis read there would force the WHOLE site dynamic: Next treats any live `fetch()` in a Server
 * Component as a reason to opt the route out of static generation, even one whose result is only used on a
 * fallback path. Revalidating every 60s keeps the footer eventually consistent with /admin/frameworks without
 * that cost — the frameworkIndex block and the admin picker still read live (see cms/BlockRenderer.tsx and the
 * admin pages), so this cache is scoped to the footer alone.
 */
export const FOOTER_FRAMEWORKS_TAG = 'footer-frameworks';

export const getFooterFrameworks = unstable_cache(
  async (): Promise<Framework[]> => [...(await getFrameworksWithFallback())],
  [FOOTER_FRAMEWORKS_TAG],
  { revalidate: 60, tags: [FOOTER_FRAMEWORKS_TAG] },
);
