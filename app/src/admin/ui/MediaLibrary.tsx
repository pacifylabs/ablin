'use client';

import { useRef, useState } from 'react';
import type { Media } from '@/cms/collections/media-schema';
import { uploadToLibrary } from './MediaField';
import { TextField } from './fields/shared';
import { useSave } from './save';
import styles from './admin.module.css';

/**
 * The media library (DS v3 §9): upload to Cloudinary, edit alt text and credit, delete (refused while an image is
 * still used anywhere). Alt text edited here updates every place the image appears.
 */
export function MediaLibrary({ initial }: { initial: Media[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList) {
    setBusy(true);
    setError(null);
    for (const file of Array.from(files)) {
      const result = await uploadToLibrary(file);
      if ('error' in result) {
        setError(`${file.name}: ${result.error}`);
        break;
      }
    }
    const response = await fetch('/api/admin/media');
    if (response.ok) setItems((await response.json()) as Media[]);
    setBusy(false);
  }

  return (
    <div>
      <div className={styles.formActions}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Uploading…' : 'Upload images'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) void onFiles(e.target.files);
            e.target.value = '';
          }}
        />
        {error ? (
          <p className={styles.formNote} data-tone="error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      {items.length === 0 ? <p className={styles.hint}>No images yet.</p> : null}
      <ul className={styles.libraryGrid}>
        {items.map((m) => (
          <MediaCard
            key={m.id}
            media={m}
            onDeleted={() => setItems((all) => all.filter((x) => x.id !== m.id))}
          />
        ))}
      </ul>
    </div>
  );
}

function MediaCard({ media, onDeleted }: { media: Media; onDeleted: () => void }) {
  const [alt, setAlt] = useState(media.alt);
  const [credit, setCredit] = useState(media.credit);
  const save = useSave();
  const remove = useSave();
  const dirty = alt !== media.alt || credit !== media.credit;

  return (
    <li className={styles.libraryCard}>
      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a library URL */}
      <img src={media.url} alt="" />
      <p className={styles.hint}>
        {media.id} · {media.width}×{media.height}
      </p>
      <TextField
        label="Alt text"
        value={alt}
        placeholder="Describe the photo, or leave empty if decorative"
        onChange={setAlt}
      />
      <TextField
        label="Credit / source"
        value={credit}
        placeholder="e.g. https://unsplash.com/photos/…"
        onChange={setCredit}
      />
      {save.error || remove.error ? (
        <p className={styles.fieldError} role="alert">
          {save.error ?? remove.error}
        </p>
      ) : null}
      <div className={styles.mediaActions}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!dirty || save.status === 'saving'}
          onClick={() => void save.send(`/api/admin/media/${media.id}`, 'PATCH', { alt, credit })}
        >
          {save.status === 'saved' && !dirty ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => void navigator.clipboard?.writeText(media.url)}
        >
          Copy URL
        </button>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={async () => {
            if (!confirm('Delete this image from the library?')) return;
            if (await remove.send(`/api/admin/media/${media.id}`, 'DELETE')) onDeleted();
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
