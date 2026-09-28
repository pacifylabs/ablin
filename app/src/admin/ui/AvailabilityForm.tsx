'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { Availability, AvailabilityCopy } from '@/cms/schema';
import { defaultAvailabilityCopy } from '@/cms/globals/defaults';
import { TextField } from './fields/shared';
import styles from './admin.module.css';

const MODES: { value: Availability['mode']; label: string }[] = [
  { value: 'live', label: 'Live — the public site' },
  { value: 'coming_soon', label: 'Coming soon' },
  { value: 'under_construction', label: 'Under construction (maintenance)' },
];

/** Saving here takes effect immediately: the edge middleware re-reads settings:availability on every request
 *  (cached for at most 5 seconds — see src/middleware.ts). */
export function AvailabilityForm({ initial }: { initial: Availability }) {
  const router = useRouter();
  const [mode, setMode] = useState(initial.mode);
  const [comingSoon, setComingSoon] = useState<AvailabilityCopy>(
    initial.comingSoon ?? { ...defaultAvailabilityCopy.comingSoon },
  );
  const [underConstruction, setUnderConstruction] = useState<AvailabilityCopy>(
    initial.underConstruction ?? { ...defaultAvailabilityCopy.underConstruction },
  );
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      const response = await fetch('/api/admin/settings/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, message: initial.message, comingSoon, underConstruction }),
      });
      setStatus(response.ok ? 'saved' : 'error');
      if (response.ok) router.refresh();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {status === 'saved' ? (
        <p className={styles.formNote} data-tone="success">
          Saved. The site now reflects this within a few seconds.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className={styles.formNote} data-tone="error" role="alert">
          Could not save. Try again.
        </p>
      ) : null}
      <fieldset className={styles.field}>
        <legend>Site availability</legend>
        {MODES.map((m) => (
          <div key={m.value} className={styles.checkboxField}>
            <input
              type="radio"
              id={`mode-${m.value}`}
              name="mode"
              checked={mode === m.value}
              onChange={() => setMode(m.value)}
            />
            <label htmlFor={`mode-${m.value}`}>{m.label}</label>
          </div>
        ))}
      </fieldset>
      <CopyFields title="Coming soon" value={comingSoon} onChange={setComingSoon} />
      <CopyFields
        title="Under construction"
        value={underConstruction}
        onChange={setUnderConstruction}
      />
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function CopyFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: AvailabilityCopy;
  onChange: (v: AvailabilityCopy) => void;
}) {
  return (
    <fieldset className={styles.repeatItem}>
      <legend className={styles.hint}>{title} page</legend>
      <TextField
        label="Headline"
        value={value.headline}
        onChange={(headline) => onChange({ ...value, headline })}
      />
      <TextField
        label="Message"
        value={value.message}
        multiline
        onChange={(message) => onChange({ ...value, message })}
      />
      <TextField
        label="Contact line (optional)"
        value={value.contactLine}
        placeholder="e.g. Email info@ablinlimited.com"
        onChange={(contactLine) => onChange({ ...value, contactLine })}
      />
    </fieldset>
  );
}
