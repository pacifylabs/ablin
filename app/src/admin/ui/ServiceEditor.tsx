'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Service } from '@/cms/collections/services';
import { BlockList } from './BlockList';
import type { BlockRefs } from './blocks/types';
import { MediaField } from './MediaField';
import { TextField } from './fields/shared';
import { SaveBar, useSave } from './save';
import styles from './admin.module.css';

/**
 * One service: the card (code pill, title, one-line summary, 4:5 photo), its SEO fields and the detail page's blocks.
 * Saves go live immediately (services have no draft stage).
 */
export function ServiceEditor({ initial, refs }: { initial: Service; refs: BlockRefs }) {
  const [service, setService] = useState(initial);
  const save = useSave();
  const remove = useSave();
  const router = useRouter();
  const set = (patch: Partial<Service>) => setService((s) => ({ ...s, ...patch }));

  return (
    <div>
      <div className={styles.panel}>
        <p className={styles.panelTitle}>Card</p>
        <TextField
          label="Code pill"
          value={service.code}
          placeholder="e.g. GRC"
          onChange={(code) => set({ code })}
        />
        <TextField label="Title" value={service.title} onChange={(title) => set({ title })} />
        <TextField
          label="One-line summary"
          value={service.summary}
          multiline
          onChange={(summary) => set({ summary })}
        />
        <MediaField
          label="Card photo (shown 4:5)"
          value={service.cardImage}
          onChange={(cardImage) => set({ cardImage })}
        />
      </div>

      <div className={styles.panel}>
        <p className={styles.panelTitle}>Search and sharing</p>
        <TextField
          label="SEO title (optional)"
          value={service.seoTitle}
          onChange={(seoTitle) => set({ seoTitle })}
        />
        <TextField
          label="SEO description (optional)"
          value={service.seoDescription}
          multiline
          onChange={(seoDescription) => set({ seoDescription })}
        />
      </div>

      <p className={styles.panelTitle} style={{ marginTop: 'var(--s-32)' }}>
        Detail page blocks
      </p>
      <BlockList blocks={service.blocks} onChange={(blocks) => set({ blocks })} refs={refs} />

      <SaveBar
        status={save.status}
        error={save.error ?? remove.error}
        onSave={() => void save.send(`/api/admin/services/${service.slug}`, 'PUT', service)}
      >
        <a
          className="btn btn-line"
          href={`/services/${service.slug}`}
          target="_blank"
          rel="noopener"
        >
          View live page
        </a>
        <button
          type="button"
          className="btn btn-line"
          onClick={async () => {
            if (!confirm(`Delete the service “${service.title}”? Its page will stop existing.`))
              return;
            if (await remove.send(`/api/admin/services/${service.slug}`, 'DELETE'))
              router.push('/admin/services');
          }}
        >
          Delete
        </button>
      </SaveBar>
    </div>
  );
}
