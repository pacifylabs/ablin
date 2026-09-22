'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FRAMEWORK_IDS, type Framework } from '@/content/schema';
import { MoveDeleteButtons, TextField, move } from './fields/shared';
import styles from './admin.module.css';

interface Item {
  id: (typeof FRAMEWORK_IDS)[number];
  included: boolean;
  data: Framework;
}

/**
 * Manages the fixed five frameworks: their text, their order, and whether each appears at all — in the footer
 * slider and in the frameworkIndex block's picker (see admin/README.md §Frameworks). The five ids themselves are
 * fixed (each has its own hand-drawn glyph with no generic fallback — see ui/FrameworkBadge.tsx), so this
 * reorders, edits and shows/hides; it doesn't add a sixth.
 */
export function FrameworksEditor({
  initial,
  seedById,
}: {
  initial: readonly Framework[];
  seedById: Record<string, Framework>;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(() => {
    const included = initial.map((f) => ({ id: f.id, included: true, data: f }));
    const includedIds = new Set(initial.map((f) => f.id));
    const excluded = FRAMEWORK_IDS.filter((id) => !includedIds.has(id)).map((id) => ({
      id,
      included: false,
      data: seedById[id]!,
    }));
    return [...included, ...excluded];
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  function update(id: string, patch: Partial<Item>) {
    setItems((current) => current.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function updateData(id: string, patch: Partial<Framework>) {
    setItems((current) =>
      current.map((it) => (it.id === id ? { ...it, data: { ...it.data, ...patch } } : it)),
    );
  }

  async function save() {
    setStatus('saving');
    setError(null);
    try {
      const payload = items.filter((it) => it.included).map((it) => it.data);
      const response = await fetch('/api/admin/frameworks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setError(
          'Could not save. Check that every included framework has a name, scope, publisher and at least one source.',
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

  const includedItems = items.filter((it) => it.included);

  return (
    <div>
      <div className={styles.blockList}>
        {items.map((item) => {
          const orderIndex = includedItems.findIndex((it) => it.id === item.id);
          return (
            <div key={item.id} className={styles.blockItem}>
              <div className={styles.blockItemHead}>
                <span className={styles.blockItemTitle}>
                  <input
                    type="checkbox"
                    checked={item.included}
                    onChange={(e) => update(item.id, { included: e.target.checked })}
                    aria-label={`Show ${item.data.name} in the frameworks strip`}
                  />
                  {item.data.name}
                </span>
                {item.included ? (
                  <MoveDeleteButtons
                    index={orderIndex}
                    count={includedItems.length}
                    onMove={(to) => {
                      const reordered = move(includedItems, orderIndex, to);
                      const excluded = items.filter((it) => !it.included);
                      setItems([...reordered, ...excluded]);
                    }}
                    onDelete={() => update(item.id, { included: false })}
                  />
                ) : null}
              </div>
              {item.included ? (
                <div className={styles.blockItemBody}>
                  <TextField
                    label="Name"
                    value={item.data.name}
                    onChange={(v) => updateData(item.id, { name: v })}
                  />
                  <TextField
                    label="Scope"
                    value={item.data.scope}
                    onChange={(v) => updateData(item.id, { scope: v })}
                  />
                  <TextField
                    label="Publisher"
                    value={item.data.publisher}
                    onChange={(v) => updateData(item.id, { publisher: v })}
                  />
                  <TextField
                    label="Edition (optional)"
                    value={item.data.edition ?? ''}
                    onChange={(v) => updateData(item.id, { edition: v || undefined })}
                  />
                  <div className={styles.field}>
                    <label>Sources</label>
                    {item.data.sources.map((source, i) => (
                      <fieldset key={i} className={styles.repeatItem}>
                        <div className={styles.repeatRow}>
                          <legend className={styles.hint}>Source {i + 1}</legend>
                          {item.data.sources.length > 1 ? (
                            <button
                              type="button"
                              className={styles.iconBtn}
                              data-danger="true"
                              aria-label="Remove source"
                              onClick={() =>
                                updateData(item.id, {
                                  sources: item.data.sources.filter((_, j) => j !== i),
                                })
                              }
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                        <TextField
                          label="Label"
                          value={source.label}
                          placeholder="e.g. ISO/IEC 27001:2022 on iso.org"
                          onChange={(v) =>
                            updateData(item.id, {
                              sources: item.data.sources.map((s, j) =>
                                j === i ? { ...s, label: v } : s,
                              ),
                            })
                          }
                        />
                        <TextField
                          label="URL"
                          value={source.url}
                          placeholder="https://…"
                          onChange={(v) =>
                            updateData(item.id, {
                              sources: item.data.sources.map((s, j) =>
                                j === i ? { ...s, url: v } : s,
                              ),
                            })
                          }
                        />
                      </fieldset>
                    ))}
                    <button
                      type="button"
                      className={styles.iconBtn}
                      style={{ width: 'auto', padding: '0 0.75rem' }}
                      onClick={() =>
                        updateData(item.id, {
                          sources: [...item.data.sources, { label: '', url: 'https://' }],
                        })
                      }
                    >
                      + Add source
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

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
