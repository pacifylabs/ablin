'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './admin.module.css';

export function DeleteArticleButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/insights/${slug}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/admin/insights');
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.iconBtn}
      data-danger="true"
      style={{ width: 'auto', padding: '0 0.75rem' }}
      disabled={pending}
      onClick={onDelete}
    >
      {pending ? 'Deleting…' : 'Delete article'}
    </button>
  );
}
