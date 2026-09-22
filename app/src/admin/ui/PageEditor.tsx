'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Block, PageDoc } from '@/cms/schema';
import { BlockList } from './BlockList';
import type { BlockRefs } from './BlockFields';
import { TextField } from './fields/shared';
import styles from './admin.module.css';

export function PageEditor({ page, refs }: { page: PageDoc; refs: BlockRefs }) {
  const router = useRouter();
  // Editing starts from the staged draft when one exists, so unpublished edits aren't lost on reload.
  const initial = page.draft ?? page;
  const [title, setTitle] = useState(initial.title);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [blocks, setBlocks] = useState<Block[]>(initial.blocks);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function save(publish: boolean) {
    setStatus('saving');
    setError(null);
    try {
      const response = await fetch(`/api/admin/pages/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          seoTitle,
          seoDescription,
          ogImage: page.ogImage,
          blocks,
          publish,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        setError(
          body?.message ??
            (body?.error === 'unsafe_content'
              ? 'One of the rich-text blocks contains unsupported content.'
              : 'Could not save. Check the fields and try again.'),
        );
        setStatus('error');
        return;
      }
      setStatus('saved');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('error');
    }
  }

  return (
    <div>
      <div className={styles.panel}>
        <p className={styles.panelTitle}>Page settings</p>
        <TextField
          label="Page title (internal heading, e.g. on the hero)"
          value={title}
          onChange={setTitle}
        />
        <TextField label="SEO title" value={seoTitle} onChange={setSeoTitle} />
        <TextField
          label="SEO description"
          value={seoDescription}
          onChange={setSeoDescription}
          multiline
        />
      </div>

      <p className={styles.panelTitle} style={{ marginTop: 'var(--space-8)' }}>
        Blocks
      </p>
      <BlockList blocks={blocks} onChange={setBlocks} refs={refs} />

      <div className={styles.formActions} style={{ marginTop: 'var(--space-6)' }}>
        {error ? (
          <p className={styles.formNote} data-tone="error" role="alert">
            {error}
          </p>
        ) : null}
        {status === 'saved' ? (
          <p className={styles.formNote} data-tone="success">
            Saved.
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn-ghost"
          disabled={status === 'saving'}
          onClick={() => save(false)}
        >
          Save draft
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={status === 'saving'}
          onClick={() => save(true)}
        >
          {status === 'saving' ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
