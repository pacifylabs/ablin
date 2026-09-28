'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Block, PageDoc } from '@/cms/schema';
import { BlockList } from './BlockList';
import type { BlockRefs } from './blocks/registry';
import { MediaField } from './MediaField';
import { CheckboxField } from './fields/more';
import { TextField } from './fields/shared';
import styles from './admin.module.css';

/** Public path for a page slug; null for the availability pages, which only show while the site is gated. */
function pagePath(slug: string): string | null {
  if (slug === 'home') return '/';
  if (slug === 'coming-soon' || slug === 'under-construction') return null;
  return `/${slug}`;
}

export function PageEditor({ page, refs }: { page: PageDoc; refs: BlockRefs }) {
  const previewPath = pagePath(page.slug);
  const router = useRouter();
  // Editing starts from the staged draft when one exists, so unpublished edits aren't lost on reload.
  const initial = page.draft ?? page;
  const [title, setTitle] = useState(initial.title);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [ogImage, setOgImage] = useState(initial.ogImage);
  const [noindex, setNoindex] = useState(initial.noindex);
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
          ogImage,
          noindex,
          blocks,
          publish,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
          issues?: { path: string; message: string }[];
        } | null;
        const issue = body?.issues?.[0];
        setError(
          body?.message ??
            (issue
              ? `${describePath(issue.path, blocks)}: ${issue.message}`
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
        <MediaField
          label="Share image (optional — defaults to the site image)"
          value={ogImage}
          onChange={setOgImage}
        />
        <CheckboxField
          label="Hide from search engines (noindex)"
          checked={noindex}
          onChange={setNoindex}
        />
      </div>

      <p className={styles.panelTitle} style={{ marginTop: 'var(--s-32)' }}>
        Blocks
      </p>
      <BlockList blocks={blocks} onChange={setBlocks} refs={refs} />

      <div className={styles.formActions} style={{ marginTop: 'var(--s-24)' }}>
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
        {previewPath ? (
          <a
            className="btn btn-line"
            href={`/api/admin/preview?path=${encodeURIComponent(previewPath)}`}
            target="_blank"
            rel="noopener"
          >
            Preview draft
          </a>
        ) : null}
        <button
          type="button"
          className="btn btn-line"
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

/** "blocks.3.data.title" → "Block 4 (Hero (framed photo)) › title", so a validation error points at the field. */
function describePath(path: string, blocks: readonly Block[]): string {
  const m = /^blocks\.(\d+)\.(?:data\.)?(.*)$/.exec(path);
  if (!m) return path;
  const index = Number(m[1]);
  const block = blocks[index];
  return `Block ${index + 1}${block ? ` (${block.type})` : ''} › ${m[2] || 'block'}`;
}
