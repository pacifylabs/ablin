import { getAudiences, getServices } from '@/lib/content';
import { getFrameworksWithFallback } from './store';
import { isRichDocSafe } from './richtext';
import type { Block } from './schema';

/**
 * Checks a block list against the master data it references by slug/id (services, audiences, frameworks) and
 * against the rich-text allow-list, before it's ever written to Redis. lib/content.ts used to run an equivalent
 * check at import time for the old, page-shaped JSON; blocks need it here instead, at save time, since a
 * dangling reference would otherwise only surface as a silently-skipped item when the page renders.
 *
 * Returns a human-readable message for the first problem found, or null if the blocks are all internally
 * consistent.
 */
export async function findBlockReferenceError(blocks: readonly Block[]): Promise<string | null> {
  const [services, audiences, frameworks] = await Promise.all([
    getServices(),
    getAudiences(),
    getFrameworksWithFallback(),
  ]);
  const serviceSlugs = new Set(services.map((s) => s.slug));
  const audienceSlugs = new Set(audiences.map((a) => a.slug));
  const frameworkIds = new Set<string>(frameworks.map((f) => f.id));

  for (const block of blocks) {
    switch (block.type) {
      case 'capabilityGrid':
        for (const item of block.data.items) {
          if (!serviceSlugs.has(item.serviceSlug))
            return `Unknown service "${item.serviceSlug}" in ${block.id}`;
        }
        break;
      case 'serviceList':
        for (const slug of block.data.serviceSlugs) {
          if (!serviceSlugs.has(slug)) return `Unknown service "${slug}" in ${block.id}`;
        }
        break;
      case 'audienceGrid':
        for (const slug of block.data.audienceSlugs) {
          if (!audienceSlugs.has(slug)) return `Unknown audience "${slug}" in ${block.id}`;
        }
        break;
      case 'frameworkIndex':
        for (const id of block.data.frameworkIds) {
          if (!frameworkIds.has(id)) return `Unknown framework "${id}" in ${block.id}`;
        }
        break;
      case 'textRich':
        if (!isRichDocSafe(block.data.doc)) return `Unsupported rich-text content in ${block.id}`;
        break;
      default:
        break;
    }
  }
  return null;
}
