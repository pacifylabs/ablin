'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import styles from './admin.module.css';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function NewArticleForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          excerpt: title,
          topics: [],
          blocks: [],
          seoTitle: title,
          seoDescription: title,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(
          body?.error === 'slug_taken'
            ? 'That URL is already used by another article.'
            : 'Could not create the article. Check the fields and try again.',
        );
        return;
      }
      router.push(`/admin/insights/${slug}`);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? (
        <p className={styles.formNote} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.field}>
        <label htmlFor="new-article-title">Title</label>
        <input
          id="new-article-title"
          className={styles.input}
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="new-article-slug">URL (/insights/…)</label>
        <input
          id="new-article-slug"
          className={styles.input}
          required
          pattern="[a-z0-9-]+"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
        />
        <p className={styles.hint}>Lowercase letters, numbers and hyphens only.</p>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary" disabled={pending || !title || !slug}>
          {pending ? 'Creating…' : 'Create draft'}
        </button>
      </div>
    </form>
  );
}
