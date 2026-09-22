'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import type { BlockImage } from '@/cms/schema';
import styles from './admin.module.css';

/** Upload-and-preview control for any block field that holds a BlockImage (Cloudinary, signed server-side). */
export function ImagePicker({
  value,
  onChange,
  label,
}: {
  value: BlockImage | undefined;
  onChange: (image: BlockImage | undefined) => void;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const altId = useId();
  const captionId = useId();

  async function onFile(file: File) {
    setPending(true);
    setError(null);
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/admin/upload/image', { method: 'POST', body: form });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(
          body?.error === 'not_an_image'
            ? 'That file is not a readable image.'
            : body?.error === 'too_large'
              ? 'That file is too large (4MB maximum).'
              : 'Upload failed. Try again.',
        );
        return;
      }
      const uploaded = (await response.json()) as {
        url: string;
        width: number;
        height: number;
        blur: string;
      };
      onChange({
        url: uploaded.url,
        alt: value?.alt ?? '',
        caption: value?.caption,
        width: uploaded.width,
        height: uploaded.height,
        blur: uploaded.blur,
      });
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.field}>
      <label>{label}</label>
      {value ? (
        <div className={styles.imagePreview}>
          <Image
            src={value.url}
            alt=""
            fill
            sizes="256px"
            style={{ objectFit: 'cover' }}
            unoptimized={value.url.startsWith('/')}
          />
        </div>
      ) : null}
      {error ? (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.iconBtn}
          style={{ width: 'auto', padding: '0 0.75rem' }}
          onClick={() => inputRef.current?.click()}
          disabled={pending}
        >
          {pending ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
        </button>
        {value ? (
          <button
            type="button"
            className={styles.iconBtn}
            data-danger="true"
            style={{ width: 'auto', padding: '0 0.75rem' }}
            onClick={() => onChange(undefined)}
          >
            Remove
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = '';
        }}
      />
      {value ? (
        <>
          <label htmlFor={altId}>Alt text (empty if purely decorative)</label>
          <input
            id={altId}
            className={styles.input}
            value={value.alt}
            placeholder="Describe what the image shows"
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
          <label htmlFor={captionId}>Caption (optional)</label>
          <input
            id={captionId}
            className={styles.input}
            value={value.caption ?? ''}
            placeholder="Enter a caption"
            onChange={(e) => onChange({ ...value, caption: e.target.value || undefined })}
          />
        </>
      ) : null}
    </div>
  );
}
