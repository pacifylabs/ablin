'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Framework } from '@/cms/collections/frameworks';
import { ICON_NAMES } from '@/cms/collections/icons';
import { MediaField } from './MediaField';
import { MoveDeleteButtons, SelectField, TextField, move } from './fields/shared';
import styles from './admin.module.css';

const BLANK: Framework = {
  id: '',
  name: '',
  descriptor: '',
  icon: 'document',
  logo: null,
  approvedByClient: false,
  publisher: '',
  edition: '',
  sources: [],
};

/**
 * The `frameworks` collection: order is display order in the footer strip and the frameworkStrip block. A logo is
 * shown only when "Approved by the client" is ticked (DS v3 §7.6); otherwise the chosen line icon is used.
 */
export function FrameworksEditor({ initial }: { initial: readonly Framework[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Framework[]>(() => [...initial]);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  function update(index: number, patch: Partial<Framework>) {
    setItems((current) => current.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  async function save() {
    setStatus('saving');
    setError(null);
    try {
      const response = await fetch('/api/admin/frameworks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          issues?: { path: string; message: string }[];
        };
        const first = body.issues?.[0];
        setError(first ? `${first.path}: ${first.message}` : 'Could not save.');
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
      <div className={styles.blockList}>
        {items.map((item, index) => (
          <div key={index} className={styles.blockItem}>
            <div className={styles.blockItemHead}>
              <span className={styles.blockItemTitle}>{item.name || 'New framework'}</span>
              <MoveDeleteButtons
                index={index}
                count={items.length}
                onMove={(to) => setItems((c) => move(c, index, to))}
                onDelete={() => setItems((c) => c.filter((_, i) => i !== index))}
              />
            </div>
            <div className={styles.blockItemBody}>
              <TextField
                label="Name"
                value={item.name}
                onChange={(v) => update(index, { name: v })}
              />
              <TextField
                label="Identifier"
                value={item.id}
                placeholder="e.g. iso-27001"
                hint="Lowercase letters, numbers and hyphens. Used by blocks that pick frameworks."
                onChange={(v) => update(index, { id: v })}
              />
              <TextField
                label="Descriptor"
                value={item.descriptor}
                placeholder="e.g. Information security"
                onChange={(v) => update(index, { descriptor: v })}
              />
              <SelectField
                label="Icon"
                value={item.icon}
                options={ICON_NAMES}
                onChange={(v) => update(index, { icon: v })}
              />
              <MediaField
                label="Logo (optional — shown only when approved by the client)"
                value={item.logo}
                onChange={(logo) => update(index, { logo })}
              />
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={item.approvedByClient}
                  onChange={(e) => update(index, { approvedByClient: e.target.checked })}
                />
                Approved by the client (the logo is only shown when this is ticked)
              </label>
              <TextField
                label="Publisher (optional)"
                value={item.publisher}
                onChange={(v) => update(index, { publisher: v })}
              />
              <TextField
                label="Edition (optional)"
                value={item.edition}
                onChange={(v) => update(index, { edition: v })}
              />
              {item.sources.map((source, i) => (
                <fieldset key={i} className={styles.repeatItem}>
                  <legend className={styles.hint}>Source {i + 1}</legend>
                  <TextField
                    label="Label"
                    value={source.label}
                    placeholder="e.g. ISO/IEC 27001:2022 on iso.org"
                    onChange={(v) =>
                      update(index, {
                        sources: item.sources.map((s, j) => (j === i ? { ...s, label: v } : s)),
                      })
                    }
                  />
                  <TextField
                    label="URL"
                    value={source.url}
                    placeholder="https://…"
                    onChange={(v) =>
                      update(index, {
                        sources: item.sources.map((s, j) => (j === i ? { ...s, url: v } : s)),
                      })
                    }
                  />
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() =>
                      update(index, { sources: item.sources.filter((_, j) => j !== i) })
                    }
                  >
                    Remove source
                  </button>
                </fieldset>
              ))}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() =>
                  update(index, { sources: [...item.sources, { label: '', url: '' }] })
                }
              >
                + Add source
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.formActions} style={{ marginTop: 'var(--s-24)' }}>
        <button
          type="button"
          className="btn btn-line"
          onClick={() => setItems((c) => [...c, { ...BLANK }])}
        >
          Add framework
        </button>
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
          className="btn btn-primary"
          disabled={status === 'saving'}
          onClick={save}
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
