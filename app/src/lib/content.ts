import { z } from 'zod';
import aboutJson from '@/content/about.json';
import approachJson from '@/content/approach.json';
import audiencesJson from '@/content/audiences.json';
import contactJson from '@/content/contact.json';
import frameworksJson from '@/content/frameworks.json';
import homeJson from '@/content/home.json';
import imagesJson from '@/content/images.json';
import insightsJson from '@/content/insights.json';
import legalJson from '@/content/legal.json';
import servicesJson from '@/content/services.json';
import servicesPageJson from '@/content/services-page.json';
import whoWeServeJson from '@/content/who-we-serve.json';
import {
  aboutSchema,
  approachSchema,
  audienceSchema,
  contactPageSchema,
  frameworkSchema,
  homeSchema,
  imagesSchema,
  insightsPageSchema,
  legalPageSchema,
  servicesPageSchema,
  serviceSchema,
  whoWeServePageSchema,
  type LegalPage,
} from '@/content/schema';

/**
 * The single seam between the site and its copy. Today each loader reads a validated JSON file; the admin
 * phase replaces the bodies with API calls returning the same shapes, and no component changes. Loaders are
 * async for that reason. Parsing at module load means malformed content fails the build, not a page view.
 */
const home = homeSchema.parse(homeJson);
const about = aboutSchema.parse(aboutJson);
const approach = approachSchema.parse(approachJson);
const services = z.array(serviceSchema).parse(servicesJson);
const audiences = z.array(audienceSchema).parse(audiencesJson);
const frameworks = z.array(frameworkSchema).parse(frameworksJson);
const servicesPage = servicesPageSchema.parse(servicesPageJson);
const whoWeServePage = whoWeServePageSchema.parse(whoWeServeJson);
const insightsPage = insightsPageSchema.parse(insightsJson);
const contactPage = contactPageSchema.parse(contactJson);
const legal = z.array(legalPageSchema).parse(legalJson);
const images = imagesSchema.parse(imagesJson);

// Every image id used by a page must exist in the manifest.
const imageRefs = [
  home.hero.image,
  home.statement.image,
  home.audiences.image,
  home.insights.image,
  home.cta.image,
  about.image,
  servicesPage.image,
  whoWeServePage.image,
  insightsPage.image,
];
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
for (const c of home.capabilities.items) {
  if (!serviceSlugs.has(c.serviceSlug))
    throw new Error(`Unknown service "${c.serviceSlug}" in home capabilities`);
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
export async function getServicesPage() {
  return servicesPage;
}
export async function getWhoWeServePage() {
  return whoWeServePage;
}
export async function getInsightsPage() {
  return insightsPage;
}
export async function getContactPage() {
  return contactPage;
}
export async function getLegalPage(slug: LegalPage['slug']) {
  const page = legal.find((p) => p.slug === slug);
  if (!page) throw new Error(`Missing legal page: ${slug}`);
  return page;
}

export function serviceHref(slug: string): string {
  return `/services/${slug}`;
}
