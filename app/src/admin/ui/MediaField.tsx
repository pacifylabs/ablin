'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Media, MediaRef } from '@/cms/collections/media-schema';
import { CheckboxField } from './fields/more';
import styles from './admin.module.css';

let libraryPromise: Promise<Media[]> | null = null;

/** The media library, fetched once per admin page load and refreshed after an upload. */
export function loadLibrary(force = false): Promise<Media[]> {
  if (!libraryPromise || force) {
    libraryPromise = fetch('/api/admin/media')
      .then((r) => (r.ok ? (r.json() as Promise<Media[]>) : []))
      .catch(() => []);
  }
  return libraryPromise;
}

export async function uploadToLibrary(
  file: File,
): Promise<{ mediaId: string } | { error: string }> {
  const form = new FormData();
  form.set('file', file);
  const response = await fetch('/api/admin/upload/image', { method: 'POST', body: form });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return {
      error:
        body?.error === 'not_an_image'
          ? 'That file is not a readable image.'
          : body?.error === 'too_large'
            ? 'That file is too large (4 MB maximum).'
            : body?.error === 'unavailable'
              ? 'Image uploads are not configured (Cloudinary).'
              : 'Upload failed. Try again.',
    };
  }
  const body = (await response.json()) as { mediaId: string };
  await loadLibrary(true);
  return body;
}

/**
 * Any image field (DS v3 §9): choose from the media library or upload a new image into it. Stores only a reference;
 * alt text and credit are edited in the library. "Decorative" renders alt="" wherever this field is used.
 */
export function MediaField({
  label,
  value,
  onChange,
  nullable = true,
}: {
  label: string;
  value: MediaRef | null;
  onChange: (ref: MediaRef | null) => void;
  nullable?: boolean;
}) {
  const [library, setLibrary] = useState<Media[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    let live = true;
    void loadLibrary().then((l) => live && setLibrary(l));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const current = value ? library?.find((m) => m.id === value.mediaId) : undefined;

  async function onFile(file: File) {
    setBusy(true);
    setError(null);
    const result = await uploadToLibrary(file);
    setBusy(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setLibrary(await loadLibrary());
    onChange({ mediaId: result.mediaId, decorative: value?.decorative ?? false });
    setOpen(false);
  }

  return (
    <fieldset className={styles.repeatItem}>
      <legend className={styles.hint}>{label}</legend>
      <div className={styles.mediaRow}>
        <div className={styles.mediaThumb}>
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an arbitrary library URL
            <img src={current.url} alt="" />
          ) : (
            <span className={styles.hint}>{value ? `Missing: ${value.mediaId}` : 'No image'}</span>
          )}
        </div>
        <div className={styles.mediaMeta}>
          {current ? (
            <p className={styles.hint}>
              {current.alt || 'No alt text yet — add it in the Media library.'}
            </p>
          ) : null}
          <div className={styles.mediaActions}>
            <button type="button" className="btn btn-line" onClick={() => setOpen(true)}>
              Choose image
            </button>
            <button
              type="button"
              className="btn btn-line"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? 'Uploading…' : 'Upload new'}
            </button>
            {nullable && value ? (
              <button type="button" className={styles.linkBtn} onClick={() => onChange(null)}>
                Remove
              </button>
            ) : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.target.value = '';
            }}
          />
          {value ? (
            <CheckboxField
              label="Decorative"
              hint="hide from screen readers (alt text is not read)"
              checked={value.decorative}
              onChange={(decorative) => onChange({ ...value, decorative })}
            />
          ) : null}
          {error ? (
            <p className={styles.fieldError} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
      >
        <div className={styles.dialogHead}>
          <h2 id={titleId}>Choose an image</h2>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        {library && library.length === 0 ? (
          <p className={styles.hint}>The library is empty. Upload an image first.</p>
        ) : null}
        <ul className={styles.mediaGrid}>
          {(library ?? []).map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={styles.mediaPick}
                aria-pressed={value?.mediaId === m.id}
                onClick={() => {
                  onChange({ mediaId: m.id, decorative: value?.decorative ?? false });
                  setOpen(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={m.url} alt="" />
                <span>{m.alt || m.id}</span>
              </button>
            </li>
          ))}
        </ul>
      </dialog>
    </fieldset>
  );
}
