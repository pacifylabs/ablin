'use client';

import { useState } from 'react';
import type { Topic } from '@/cms/collections/topics';
import { ListEditor } from './fields/more';
import { TextField } from './fields/shared';
import { SaveBar, useSave } from './save';

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

/** Insight topics, in display order. The address is generated from the name unless edited. */
export function TopicsEditor({ initial }: { initial: Topic[] }) {
  const [topics, setTopics] = useState(initial);
  const { status, error, send } = useSave();
  return (
    <>
      <ListEditor
        label="Topics"
        itemLabel="Topic"
        items={topics}
        onChange={setTopics}
        create={() => ({ name: '', slug: '' })}
        render={(topic, update) => (
          <>
            <TextField
              label="Name"
              value={topic.name}
              onChange={(name) =>
                update({
                  name,
                  slug:
                    topic.slug === toSlug(topic.name) || !topic.slug ? toSlug(name) : topic.slug,
                })
              }
            />
            <TextField
              label="Address"
              value={topic.slug}
              hint={`/insights/topic/${topic.slug || '…'}`}
              onChange={(slug) => update({ ...topic, slug })}
            />
          </>
        )}
      />
      <SaveBar
        status={status}
        error={error}
        onSave={() => void send('/api/admin/topics', 'PUT', topics)}
      />
    </>
  );
}
