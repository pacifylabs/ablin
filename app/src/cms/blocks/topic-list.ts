import { z } from 'zod';
import { optionalTextSchema, textSchema } from './common';

/** DS v3 §7.11: heading + lead left, topic chips right. Chips link to the Insights index filtered by topic. */
export const topicListData = z.object({
  eyebrow: optionalTextSchema,
  title: textSchema,
  lead: optionalTextSchema,
  /** Topic slugs in order. Empty = all topics. */
  topicSlugs: z.array(z.string()),
});
export type TopicListData = z.infer<typeof topicListData>;
export const createTopicList = (): TopicListData => ({
  eyebrow: '',
  title: '',
  lead: '',
  topicSlugs: [],
});
