'use client';

import { useState } from 'react';
import {
  BACKGROUNDS,
  BLOCK_TYPES,
  PALETTE,
  duplicateBlock,
  newBlock,
  type Block,
  type BlockType,
} from '@/cms/blocks';
import { BlockForm, type BlockRefs } from './blocks/registry';
import { SelectField, TextField, move } from './fields/shared';
import { DragHandle, SortableList } from './Sortable';
import styles from './admin.module.css';

const newId = (type: BlockType) => `${type}-${crypto.randomUUID().slice(0, 8)}`;

/**
 * The block editor (DS v3 §9): add from the closed palette, reorder (drag, keyboard, or the arrow buttons),
 * hide/show, duplicate, delete, and set each block's anchor and background. Admins edit content only; there is no styling control beyond the background.
 */
export function BlockList({
  blocks,
  onChange,
  refs,
  allowed = BLOCK_TYPES,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  refs: BlockRefs;
  allowed?: readonly BlockType[];
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(blocks.map((b) => [b.id, true])),
  );
  const [adding, setAdding] = useState<BlockType>(allowed[0] ?? 'richText');

  const update = (index: number, patch: Partial<Block>) =>
    onChange(blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as Block) : b)));

  return (
    <div>
      <SortableList items={blocks} getId={(b) => b.id} onReorder={onChange}>
        {(block, i) => {
          const label = PALETTE[block.type].label;
          const summary =
            'title' in block.data && typeof block.data.title === 'string' ? block.data.title : '';
          return (
            <div className={styles.blockItem} data-hidden={!block.visible || undefined}>
              <div className={styles.blockItemHead}>
                <DragHandle label={`Reorder ${label} (block ${i + 1})`} />
                <button
                  type="button"
                  className={styles.blockToggle}
                  aria-expanded={!collapsed[block.id]}
                  onClick={() => setCollapsed((c) => ({ ...c, [block.id]: !c[block.id] }))}
                >
                  <span className={styles.blockItemTitle}>
                    {i + 1}. {label}
                    {!block.visible ? <span className={styles.badgeMuted}>Hidden</span> : null}
                  </span>
                  {summary ? <span className={styles.hint}>{summary}</span> : null}
                </button>
                <div className={styles.blockItemActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={`Move ${label} up`}
                    disabled={i === 0}
                    onClick={() => onChange(move(blocks, i, i - 1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={`Move ${label} down`}
                    disabled={i === blocks.length - 1}
                    onClick={() => onChange(move(blocks, i, i + 1))}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={() => update(i, { visible: !block.visible })}
                  >
                    {block.visible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    className={styles.textBtn}
                    onClick={() => {
                      const copy = duplicateBlock(block, newId(block.type));
                      onChange([...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)]);
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    data-danger="true"
                    aria-label={`Delete ${label}`}
                    onClick={() => {
                      if (confirm(`Delete this ${label} block?`))
                        onChange(blocks.filter((_, j) => j !== i));
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {collapsed[block.id] ? null : (
                <div className={styles.blockItemBody}>
                  <div className={styles.blockMetaRow}>
                    <SelectField
                      label="Background"
                      value={block.background}
                      options={BACKGROUNDS}
                      onChange={(background) => update(i, { background })}
                    />
                    <TextField
                      label="Anchor (optional)"
                      value={block.anchorId}
                      placeholder="e.g. services"
                      hint="Lets links jump here with #anchor."
                      onChange={(anchorId) => update(i, { anchorId })}
                    />
                  </div>
                  <BlockForm
                    block={block}
                    refs={refs}
                    onChange={(data) => update(i, { data } as Partial<Block>)}
                  />
                </div>
              )}
            </div>
          );
        }}
      </SortableList>

      <div className={styles.panel} style={{ marginTop: 'var(--s-20)' }}>
        <p className={styles.panelTitle}>Add a block</p>
        <div className={styles.addBlock}>
          <SelectField label="Block type" value={adding} options={allowed} onChange={setAdding} />
          <p className={styles.hint}>{PALETTE[adding].help}</p>
          <button
            type="button"
            className="btn btn-line"
            onClick={() => {
              const block = newBlock(adding, newId(adding));
              setCollapsed((c) => ({ ...c, [block.id]: false }));
              onChange([...blocks, block]);
            }}
          >
            Add {PALETTE[adding].label}
          </button>
        </div>
      </div>
    </div>
  );
}
