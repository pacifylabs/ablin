'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './admin.module.css';

type Status = 'idle' | 'saving' | 'saved' | 'error';

interface Issue {
  path: string;
  message: string;
}

/** Turns an API error body into one plain sentence that names the field. */
export function describeError(body: unknown): string {
  const b = (body ?? {}) as {
    error?: string;
    message?: string;
    issues?: Issue[];
    usage?: string[];
  };
  if (b.issues?.[0]) return `${b.issues[0].path || 'Value'}: ${b.issues[0].message}`;
  if (b.message) return b.message;
  switch (b.error) {
    case 'slug_taken':
      return 'That address is already used.';
    case 'in_use':
      return `Still used by ${b.usage?.join(', ')}. Remove it there first.`;
    case 'bad_origin':
      return 'The request was blocked. Reload the page and try again.';
    case 'unauthenticated':
      return 'Your session has ended. Sign in again.';
    default:
      return 'Could not save. Check the fields and try again.';
  }
}

/** One JSON request with saving / saved / error state, refreshing server data on success. */
export function useSave() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function send(url: string, method: 'PUT' | 'POST' | 'PATCH' | 'DELETE', body?: unknown) {
    setStatus('saving');
    setError(null);
    try {
      const response = await fetch(url, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setError(describeError(json));
        setStatus('error');
        return null;
      }
      setStatus('saved');
      router.refresh();
      return json;
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('error');
      return null;
    }
  }

  return { status, error, send };
}

export function SaveBar({
  status,
  error,
  onSave,
  label = 'Save',
  children,
}: {
  status: Status;
  error: string | null;
  onSave: () => void;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.formActions} style={{ marginTop: 'var(--s-24)' }}>
      {error ? (
        <p className={styles.formNote} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      {status === 'saved' ? (
        <p className={styles.formNote} data-tone="success" role="status">
          Saved. The site shows the change on the next page load.
        </p>
      ) : null}
      {children}
      <button
        type="button"
        className="btn btn-primary"
        disabled={status === 'saving'}
        onClick={onSave}
      >
        {status === 'saving' ? 'Saving…' : label}
      </button>
    </div>
  );
}
