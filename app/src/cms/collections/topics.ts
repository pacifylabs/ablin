import { cache } from 'react';
import { z } from 'zod';
import { readCached } from '../cached';
import { textSchema } from '../fields';
import { keys } from '../keys';
import { redis } from '../redis';
import insightsJson from '@/content/insights.json';

/** Insight topics (DS v3 §9), one ordered list under `topics`. Articles reference topics by name. */
export const topicSchema = z.object({
  name: textSchema,
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens'),
});
export type Topic = z.infer<typeof topicSchema>;

export const topicsListSchema = z
  .array(topicSchema)
  .refine(
    (list) => new Set(list.map((t) => t.slug)).size === list.length,
    'Topic slugs must be unique',
  );

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function topicsFromNames(names: readonly string[]): Topic[] {
  const seen = new Set<string>();
  const out: Topic[] = [];
  for (const name of names) {
    const slug = slugify(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ name: name.trim(), slug });
  }
  return out;
}

export const SEED_TOPICS: readonly Topic[] = topicsFromNames(insightsJson.topics);

export const getTopics = cache(() =>
  readCached<readonly Topic[]>(keys.topics, topicsListSchema, SEED_TOPICS),
);

export async function readTopics(): Promise<Topic[] | null> {
  const raw = await redis().get(keys.topics);
  return raw ? topicsListSchema.parse(raw) : null;
}

export async function putTopics(list: readonly Topic[]): Promise<void> {
  await redis().set(keys.topics, list);
}

/** Adds any names not already present (articles may introduce new topics). Returns true if the list changed. */
export async function ensureTopics(names: readonly string[]): Promise<boolean> {
  const current = (await readTopics()) ?? [...SEED_TOPICS];
  const have = new Set(current.map((t) => t.slug));
  const added = topicsFromNames(names).filter((t) => !have.has(t.slug));
  if (added.length === 0) return false;
  await putTopics([...current, ...added]);
  return true;
}
