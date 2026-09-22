import { z } from 'zod';
import aboutJson from '@/content/about.json';
import approachJson from '@/content/approach.json';
import audiencesJson from '@/content/audiences.json';
import contactJson from '@/content/contact.json';
import frameworksJson from '@/content/frameworks.json';
import homeJson from '@/content/home.json';
import imagesJson from '@/content/images.json';
import insightsJson from '@/content/insights.json';
import servicesJson from '@/content/services.json';
import {
  aboutSchema,
  approachSchema,
  audienceSchema,
  contactPageSchema,
  frameworkSchema,
  homeSchema,
  imagesSchema,
  insightsPageSchema,
  serviceSchema,
} from '@/content/schema';

/**
 * The seam between the site and the copy the admin block editor does NOT cover. Home, About, Services, Who We
 * Serve and Insights are now mostly built from page:{slug}/insights:article:{slug} documents in Redis (see
 * cms/store.ts and cms/BlockRenderer.tsx) — this file now only serves:
 *   - "master data" the block editor references by slug/id rather than owns: services, audiences, frameworks,
 *     the five approach steps, and the stock-photo manifest.
 *   - the handful of pinned, non-block sections the closed block palette has no block for (see
 *     admin/README.md §Pinned sections): the Home Insights teaser, the About mission/vision cards, and the
 *     Insights page's topic/empty-state copy.
 *   - the Contact page, which carries no blocks at all (admin only edits its SEO fields — see PageDoc).
 * Parsing at module load means malformed content fails the build, not a page view.
 */
const home = homeSchema.parse(homeJson);
const about = aboutSchema.parse(aboutJson);
const approach = approachSchema.parse(approachJson);
const services = z.array(serviceSchema).parse(servicesJson);
const audiences = z.array(audienceSchema).parse(audiencesJson);
const frameworks = z.array(frameworkSchema).parse(frameworksJson);
const insightsPage = insightsPageSchema.parse(insightsJson);
const contactPage = contactPageSchema.parse(contactJson);
const images = imagesSchema.parse(imagesJson);

// Every image id used by pinned content must exist in the manifest.
const imageRefs = [home.insights.image];
for (const ref of imageRefs) {
  if (ref && !images[ref]) throw new Error(`Unknown image "${ref}" referenced by page content`);
}

// Cross-references must resolve, so an edited slug can never produce a dead link.
const serviceSlugs = new Set(services.map((s) => s.slug));
const audienceSlugs = new Set(audiences.map((a) => a.slug));
for (const s of services) {
  for (const ref of s.related) {
    if (!serviceSlugs.has(ref)) throw new Error(`Unknown related service "${ref}" in ${s.slug}`);
  }
  for (const ref of s.whoFor) {
    if (!audienceSlugs.has(ref)) throw new Error(`Unknown audience "${ref}" in ${s.slug}`);
  }
}
for (const a of audiences) {
  for (const ref of a.services) {
    if (!serviceSlugs.has(ref)) throw new Error(`Unknown service "${ref}" in ${a.slug}`);
  }
}

export async function getHome() {
  return home;
}
export async function getAbout() {
  return about;
}
export async function getApproach() {
  return approach;
}
export async function getServices() {
  return services;
}
export async function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
export async function getAudiences() {
  return audiences;
}
export async function getImage(id: string) {
  const image = images[id];
  if (!image) throw new Error(`Unknown image: ${id}`);
  return image;
}
export async function getImages() {
  return images;
}
export async function getFrameworks() {
  return frameworks;
}
export async function getInsightsPage() {
  return insightsPage;
}
export async function getContactPage() {
  return contactPage;
}

export function serviceHref(slug: string): string {
  return `/services/${slug}`;
}
