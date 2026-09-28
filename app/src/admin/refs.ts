import { getFrameworks } from '@/cms/collections/frameworks';
import { listServices } from '@/cms/collections/services';
import { getTopics } from '@/cms/collections/topics';
import type { BlockRefs } from './ui/blocks/types';

/** The collections block forms pick from, loaded once per editor page. */
export async function loadBlockRefs(): Promise<BlockRefs> {
  const [services, frameworks, topics] = await Promise.all([
    listServices(),
    getFrameworks(),
    getTopics(),
  ]);
  return {
    services: services.map((s) => ({ value: s.slug, label: s.title })),
    frameworks: frameworks.map((f) => ({ value: f.id, label: f.name })),
    topics: topics.map((t) => ({ value: t.slug, label: t.name })),
  };
}
