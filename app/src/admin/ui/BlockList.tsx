'use client';

import { useState } from 'react';
import { BLOCK_LABELS, BLOCK_TYPES, type Block, type BlockType } from '@/cms/schema';
import { BlockFields, type BlockRefs } from './BlockFields';
import { newBlock } from './new-block';
import { move } from './fields/shared';
import styles from './admin.module.css';

export function BlockList({
  blocks,
  onChange,
  refs,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  refs: BlockRefs;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function updateAt(index: number, data: Block['data']) {
    onChange(blocks.map((b, i) => (i === index ? ({ ...b, data } as Block) : b)));
  }

  return (
    <div>
      <ol className={styles.blockList}>
        {blocks.map((block, i) => (
          <li key={block.id} className={styles.blockItem}>
            <div className={styles.blockItemHead}>
              <span className={styles.blockItemTitle}>
                {i + 1}. {BLOCK_LABELS[block.type]}
              </span>
              <div className={styles.blockItemActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => onChange(move(blocks, i, i - 1))}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label="Move down"
                  disabled={i === blocks.length - 1}
                  onClick={() => onChange(move(blocks, i, i + 1))}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={collapsed[block.id] ? 'Expand' : 'Collapse'}
                  onClick={() => setCollapsed((c) => ({ ...c, [block.id]: !c[block.id] }))}
                >
                  {collapsed[block.id] ? '▾' : '▴'}
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  data-danger="true"
                  aria-label="Remove block"
                  onClick={() => {
                    if (confirm(`Remove this ${BLOCK_LABELS[block.type]} block?`))
                      onChange(blocks.filter((_, j) => j !== i));
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            {collapsed[block.id] ? null : (
              <div className={styles.blockItemBody}>
                <BlockFields block={block} onChange={(data) => updateAt(i, data)} refs={refs} />
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className={styles.panel} style={{ marginTop: 'var(--space-5)' }}>
        <p className={styles.panelTitle}>Add a block</p>
        <div className={styles.addBlock}>
          {BLOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className="btn btn-ghost"
              onClick={() => onChange([...blocks, newBlock(type, refs)])}
            >
              + {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { BlockType };
