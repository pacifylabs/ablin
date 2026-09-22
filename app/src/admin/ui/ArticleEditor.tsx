'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ArticleDoc, Block } from '@/cms/schema';
import { BlockList } from './BlockList';
import type { BlockRefs } from './BlockFields';
import { ImagePicker } from './ImagePicker';
import { StringListEditor, TextField } from './fields/shared';
import styles from './admin.module.css';

export function ArticleEditor({
  article,
  refs,
  knownTopics,
}: {
  article: ArticleDoc;
  refs: BlockRefs;
  knownTopics: readonly string[];
}) {
  const router = useRouter();
  const initial = article.draft ?? article;
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [topics, setTopics] = useState<string[]>(initial.topics);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [blocks, setBlocks] = useState<Block[]>(initial.blocks);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  function fields() {
    return { title, excerpt, coverImage, topics, seoTitle, seoDescription, blocks };
  }

  async function save() {
    setStatus('saving');
    setError(null);
    try {
      const response = await fetch(`/api/admin/insights/${article.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields()),
      });
      if (!response.ok) {
        setError('Could not save. Check the fields and try again.');
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

  async function publish(nowPublished: boolean) {
    setStatus('saving');
    setError(null);
    try {
      // Save first, so publishing always acts on the latest edit, then flip published state.
      const saveResponse = await fetch(`/api/admin/insights/${article.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields()),
      });
      if (!saveResponse.ok) throw new Error('save failed');
      const response = await fetch(
        `/api/admin/insights/${article.slug}/${nowPublished ? 'publish' : 'unpublish'}`,
        { method: 'POST' },
      );
      if (!response.ok) throw new Error('publish failed');
      setStatus('saved');
      router.refresh();
    } catch {
      setError('Could not save or change the published state. Try again.');
      setStatus('error');
    }
  }

  return (
    <div>
      <div className={styles.panel}>
        <p className={styles.panelTitle}>Article settings</p>
        <TextField label="Title" value={title} onChange={setTitle} />
        <TextField label="Excerpt" value={excerpt} onChange={setExcerpt} multiline />
        <ImagePicker label="Cover image" value={coverImage} onChange={setCoverImage} />
        <StringListEditor label="Topics" items={topics} onChange={setTopics} />
        {knownTopics.length > 0 ? (
          <p className={styles.hint}>Existing topics: {knownTopics.join(', ')}</p>
        ) : null}
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
          onClick={save}
        >
          Save draft
        </button>
        {article.status === 'published' ? (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={status === 'saving'}
            onClick={() => publish(false)}
          >
            Unpublish
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-primary"
          disabled={status === 'saving'}
          onClick={() => publish(true)}
        >
          {status === 'saving'
            ? 'Publishing…'
            : article.status === 'published'
              ? 'Publish edits'
              : 'Publish'}
        </button>
      </div>
    </div>
  );
}
