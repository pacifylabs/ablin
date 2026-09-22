/** Typed access to environment configuration. Nothing else reads process.env. */

type Env = Readonly<Record<string, string | undefined>>;

const LOCAL_URL = 'http://localhost:3000';

/**
 * The site's public origin, used for canonical URLs, Open Graph and structured data.
 *
 * An empty value counts as unset: hosting dashboards routinely save a blank variable, and `""` is not nullish, so a
 * plain `??` fallback lets it through and `new URL("")` then crashes the build. Resolution order:
 *   1. SITE_URL, when non-empty
 *   2. Vercel's production domain, then the deployment URL, when running on Vercel
 *   3. localhost, for local development
 * A non-empty SITE_URL that is not a valid URL is a mistake, so it fails loudly with a message naming the variable.
 * The result is normalised to an origin (no path, no trailing slash) so `${siteUrl}/path` never produces `//`.
 */
export function resolveSiteUrl(env: Env): string {
  const explicit = env.SITE_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      throw new Error(
        `SITE_URL must be a full URL such as https://example.com, but it is "${explicit}".`,
      );
    }
  }

  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || env.VERCEL_URL?.trim();
  if (vercelHost) return new URL(`https://${vercelHost.replace(/^https?:\/\//, '')}`).origin;

  return LOCAL_URL;
}

export const config = {
  siteUrl: resolveSiteUrl(process.env),
  /**
   * Contact-form delivery. The Next.js route handler emails each enquiry through Resend's HTTP API (server-side only;
   * never expose these with a NEXT_PUBLIC_ prefix). All three are needed; if any is missing the form reports that
   * it could not send rather than pretending to succeed.
   */
  contact: {
    resendApiKey: process.env.RESEND_API_KEY?.trim() ?? '',
    /** Inbox that receives enquiries. */
    toEmail: process.env.CONTACT_TO_EMAIL?.trim() ?? '',
    /** Verified sender, e.g. "Ablin website <enquiries@your-domain>". */
    fromEmail: process.env.CONTACT_FROM_EMAIL?.trim() ?? '',
  },
} as const;
