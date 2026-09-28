'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Service } from '@/cms/collections/services';
import { SERVICE_SLUG } from '@/cms/collections/service-rules';
import { newBlock } from '@/cms/blocks';
import { TextField } from './fields/shared';
import { SaveBar, useSave } from './save';
import { DragHandle, SortableList } from './Sortable';
import styles from './admin.module.css';

/** The services collection: drag or keyboard to reorder (saved with "Save order"), and create new services. */
export function ServicesList({ initial }: { initial: Service[] }) {
  const [items, setItems] = useState(initial);
  const order = useSave();
  const create = useSave();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const dirty = items.some((s, i) => s.slug !== initial[i]?.slug);

  async function onCreate() {
    const service: Service = {
      slug,
      order: items.length,
      code: title.slice(0, 5).toUpperCase(),
      title,
      summary: title,
      cardImage: null,
      seoTitle: title,
      seoDescription: '',
      blocks: [
        {
          ...newBlock('pageHeader', `${slug}-header`),
          data: { eyebrow: '', title, lead: '', image: null, breadcrumb: true, cta: null },
        },
      ],
    };
    const saved = await create.send('/api/admin/services', 'POST', service);
    if (saved) router.push(`/admin/services/${slug}`);
  }

  return (
    <>
      <SortableList items={items} getId={(s) => s.slug} onReorder={setItems}>
        {(service, i) => (
          <div className={styles.blockItem}>
            <div className={styles.blockItemHead}>
              <DragHandle label={`Reorder ${service.title} (position ${i + 1})`} />
              <span className={styles.blockItemTitle}>
                <span className={styles.badgeMuted}>{service.code}</span> {service.title}
              </span>
              <Link className={styles.textBtn} href={`/admin/services/${service.slug}`}>
                Edit
              </Link>
            </div>
          </div>
        )}
      </SortableList>
      {dirty ? (
        <SaveBar
          status={order.status}
          error={order.error}
          label="Save order"
          onSave={() =>
            void order.send('/api/admin/services/order', 'PUT', { slugs: items.map((s) => s.slug) })
          }
        />
      ) : null}

      <div className={styles.panel} style={{ marginTop: 'var(--s-32)' }}>
        <p className={styles.panelTitle}>New service</p>
        <TextField
          label="Title"
          value={title}
          onChange={(t) => {
            setTitle(t);
            setSlug(
              t
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 64),
            );
          }}
        />
        <TextField
          label="Address"
          value={slug}
          hint={`/services/${slug || '…'}`}
          onChange={setSlug}
        />
        <SaveBar
          status={create.status}
          error={
            create.error ??
            (slug && !SERVICE_SLUG.test(slug)
              ? 'Use lowercase letters, numbers and hyphens.'
              : null)
          }
          label="Create service"
          onSave={() => void onCreate()}
        />
      </div>
    </>
  );
}
