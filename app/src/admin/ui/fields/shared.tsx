'use client';

import { useId } from 'react';
import { illustrationScene, type IllustrationScene } from '@/content/schema';
import styles from '../admin.module.css';

export const ILLUSTRATION_SCENES = illustrationScene.options;

export function TextField({
  label,
  value,
  onChange,
  hint,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Like SelectField, but for a value/label pair (e.g. a service slug shown by its title). */
export function LabelledSelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function IllustrationField({
  value,
  onChange,
}: {
  value: IllustrationScene;
  onChange: (v: IllustrationScene) => void;
}) {
  return (
    <SelectField
      label="Illustration"
      value={value}
      options={ILLUSTRATION_SCENES}
      onChange={onChange}
    />
  );
}

export interface Cta {
  label: string;
  href: string;
}

export function CtaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Cta;
  onChange: (v: Cta) => void;
}) {
  return (
    <fieldset className={styles.repeatItem}>
      <legend className={styles.hint}>{label}</legend>
      <TextField
        label="Button label"
        value={value.label}
        onChange={(v) => onChange({ ...value, label: v })}
      />
      <TextField
        label="Link (e.g. /contact)"
        value={value.href}
        onChange={(v) => onChange({ ...value, href: v })}
      />
    </fieldset>
  );
}

/** Editable list of plain strings (e.g. hero framework names), with add/remove/reorder. */
export function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: readonly string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      {items.map((item, i) => (
        <div key={i} className={styles.repeatRow}>
          <input
            className={styles.input}
            value={item}
            onChange={(e) => onChange(items.map((it, j) => (j === i ? e.target.value : it)))}
          />
          <MoveDeleteButtons
            index={i}
            count={items.length}
            onMove={(to) => onChange(move(items, i, to))}
            onDelete={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <button
        type="button"
        className={styles.iconBtn}
        style={{ width: 'auto', padding: '0 0.75rem' }}
        onClick={() => onChange([...items, ''])}
      >
        + Add
      </button>
    </div>
  );
}

/** Editable list of {title, description} pairs (approach steps, why points/cells), with optional add/remove. */
export function TitleDescListEditor({
  label,
  items,
  onChange,
  fixedCount,
}: {
  label: string;
  items: readonly { title: string; description: string }[];
  onChange: (items: { title: string; description: string }[]) => void;
  /** When true, items can be edited but not added or removed (approachSteps is always exactly 5). */
  fixedCount?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      {items.map((item, i) => (
        <fieldset key={i} className={styles.repeatItem}>
          <div className={styles.repeatRow}>
            <legend className={styles.hint}>
              {label} {i + 1}
            </legend>
            {!fixedCount ? (
              <MoveDeleteButtons
                index={i}
                count={items.length}
                onMove={(to) => onChange(move(items, i, to))}
                onDelete={() => onChange(items.filter((_, j) => j !== i))}
              />
            ) : null}
          </div>
          <TextField
            label="Title"
            value={item.title}
            onChange={(v) => onChange(items.map((it, j) => (j === i ? { ...it, title: v } : it)))}
          />
          <TextField
            label="Description"
            value={item.description}
            onChange={(v) =>
              onChange(items.map((it, j) => (j === i ? { ...it, description: v } : it)))
            }
            multiline
          />
        </fieldset>
      ))}
      {!fixedCount ? (
        <button
          type="button"
          className={styles.iconBtn}
          style={{ width: 'auto', padding: '0 0.75rem' }}
          onClick={() => onChange([...items, { title: '', description: '' }])}
        >
          + Add
        </button>
      ) : null}
    </div>
  );
}

/** Fixed-universe multi-select (which services/audiences/frameworks a block references), as checkboxes so a
 *  reference can never be typed wrong — see cms/validate-blocks.ts, which this makes practically unreachable. */
export function SlugChecklist({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly { slug: string; title: string }[];
  selected: readonly string[];
  onChange: (slugs: string[]) => void;
}) {
  const idPrefix = useId();
  return (
    <fieldset className={styles.field}>
      <legend>{label}</legend>
      {options.map((opt) => {
        const checked = selected.includes(opt.slug);
        const id = `${idPrefix}-${opt.slug}`;
        return (
          <div key={opt.slug} className={styles.checkboxField}>
            <input
              type="checkbox"
              id={id}
              checked={checked}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...selected, opt.slug]
                    : selected.filter((s) => s !== opt.slug),
                )
              }
            />
            <label htmlFor={id}>{opt.title}</label>
          </div>
        );
      })}
    </fieldset>
  );
}

export function MoveDeleteButtons({
  index,
  count,
  onMove,
  onDelete,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className={styles.blockItemActions}>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
      >
        ↓
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        data-danger="true"
        aria-label="Remove"
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  );
}

export function move<T>(items: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return [...items];
  const copy = [...items];
  const [moved] = copy.splice(from, 1);
  if (moved === undefined) return copy;
  copy.splice(to, 0, moved);
  return copy;
}
