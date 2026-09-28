'use client';

import { useId } from 'react';
import { MoveDeleteButtons, TextField, move } from './shared';
import styles from '../admin.module.css';

export interface LinkValue {
  label: string;
  href: string;
}

/** A button or link: label + destination. */
export function LinkField({
  label,
  value,
  onChange,
  labelPlaceholder = 'e.g. Speak to Our Consultants',
}: {
  label: string;
  value: LinkValue;
  onChange: (v: LinkValue) => void;
  labelPlaceholder?: string;
}) {
  return (
    <fieldset className={styles.repeatItem}>
      <legend className={styles.hint}>{label}</legend>
      <TextField
        label="Text"
        value={value.label}
        placeholder={labelPlaceholder}
        onChange={(v) => onChange({ ...value, label: v })}
      />
      <TextField
        label="Link"
        value={value.href}
        placeholder="e.g. /contact, #services or https://…"
        onChange={(v) => onChange({ ...value, href: v })}
      />
    </fieldset>
  );
}

/** A link that can be switched off (null). */
export function OptionalLinkField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LinkValue | null;
  onChange: (v: LinkValue | null) => void;
}) {
  return (
    <div className={styles.field}>
      <CheckboxField
        label={`Show ${label.toLowerCase()}`}
        checked={value !== null}
        onChange={(on) => onChange(on ? { label: '', href: '/contact' } : null)}
      />
      {value ? <LinkField label={label} value={value} onChange={onChange} /> : null}
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={styles.checkboxField}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={id}>
        {label}
        {hint ? <span className={styles.hint}> — {hint}</span> : null}
      </label>
    </div>
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={styles.input}
        type="number"
        min={min}
        max={max}
        value={value}
        placeholder={String(min)}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
      />
    </div>
  );
}

/** Add / remove / reorder any list; each item is edited by `render`. */
export function ListEditor<T>({
  label,
  itemLabel,
  items,
  onChange,
  create,
  render,
  min = 0,
  max = Infinity,
}: {
  label: string;
  itemLabel: string;
  items: readonly T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, update: (item: T) => void, index: number) => React.ReactNode;
  min?: number;
  max?: number;
}) {
  return (
    <fieldset className={styles.field}>
      <legend>{label}</legend>
      {items.map((item, i) => (
        <div key={i} className={styles.repeatItem}>
          <div className={styles.repeatRow}>
            <span className={styles.hint}>
              {itemLabel} {i + 1}
            </span>
            <MoveDeleteButtons
              index={i}
              count={items.length}
              onMove={(to) => onChange(move(items, i, to))}
              onDelete={() => items.length > min && onChange(items.filter((_, j) => j !== i))}
            />
          </div>
          {render(item, (next) => onChange(items.map((it, j) => (j === i ? next : it))), i)}
        </div>
      ))}
      {items.length < max ? (
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => onChange([...items, create()])}
        >
          + Add {itemLabel.toLowerCase()}
        </button>
      ) : null}
    </fieldset>
  );
}

/** Pick and order items from a fixed collection (services, frameworks, topics). Empty = "all". */
export function RefPicker({
  label,
  options,
  selected,
  onChange,
  allLabel,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  selected: readonly string[];
  onChange: (values: string[]) => void;
  allLabel: string;
}) {
  const idPrefix = useId();
  const all = selected.length === 0;
  return (
    <fieldset className={styles.field}>
      <legend>{label}</legend>
      <CheckboxField
        label={allLabel}
        checked={all}
        onChange={(on) => onChange(on ? [] : options.map((o) => o.value))}
      />
      {all
        ? null
        : options.map((opt) => {
            const id = `${idPrefix}-${opt.value}`;
            const checked = selected.includes(opt.value);
            return (
              <div key={opt.value} className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id={id}
                  checked={checked}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, opt.value]
                        : selected.filter((v) => v !== opt.value),
                    )
                  }
                />
                <label htmlFor={id}>{opt.label}</label>
              </div>
            );
          })}
    </fieldset>
  );
}
