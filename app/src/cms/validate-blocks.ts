import type { Block } from './blocks';
import { getFrameworks } from './collections/frameworks';
import { readMedia } from './collections/media';
import { listServices } from './collections/services';
import { getTopics } from './collections/topics';
import { isRichDocSafe } from './richtext';

/** Every media reference a block holds. */
export function mediaIdsOf(block: Block): string[] {
  const d = block.data as Record<string, unknown>;
  const ids: string[] = [];
  for (const key of ['image', 'logo']) {
    const ref = d[key] as { mediaId?: string } | null | undefined;
    if (ref?.mediaId) ids.push(ref.mediaId);
  }
  return ids;
}

/**
 * Checks a block list against the collections it references (services, frameworks, topics, media) and the rich-text
 * allow-list before it is written to Redis, so a dangling reference is caught at save time rather than rendering as
 * a silently missing card. Returns a message for the first problem, or null.
 */
export async function findBlockReferenceError(blocks: readonly Block[]): Promise<string | null> {
  const [services, frameworks, topics] = await Promise.all([
    listServices(),
    getFrameworks(),
    getTopics(),
  ]);
  const serviceSlugs = new Set(services.map((s) => s.slug));
  const frameworkIds = new Set(frameworks.map((f) => f.id));
  const topicSlugs = new Set(topics.map((t) => t.slug));

  for (const [index, block] of blocks.entries()) {
    const where = `block ${index + 1} (${block.type})`;
    switch (block.type) {
      case 'serviceCarousel':
        for (const slug of block.data.serviceSlugs)
          if (!serviceSlugs.has(slug)) return `Unknown service "${slug}" in ${where}`;
        break;
      case 'frameworkStrip':
        for (const id of block.data.frameworkIds)
          if (!frameworkIds.has(id)) return `Unknown framework "${id}" in ${where}`;
        break;
      case 'topicList':
        for (const slug of block.data.topicSlugs)
          if (!topicSlugs.has(slug)) return `Unknown topic "${slug}" in ${where}`;
        break;
      case 'richText':
        if (!isRichDocSafe(block.data.doc)) return `Unsupported rich-text content in ${where}`;
        break;
      case 'splitImage':
        if (!isRichDocSafe(block.data.body)) return `Unsupported rich-text content in ${where}`;
        break;
      default:
        break;
    }
    for (const id of mediaIdsOf(block)) {
      if (!(await readMedia(id)))
        return `Unknown image "${id}" in ${where} — pick one from the media library`;
    }
  }
  return null;
}
