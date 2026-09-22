'use client';

import { useState, type FormEvent } from 'react';
import { PasswordField } from './fields/shared';
import styles from './admin.module.css';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const response = await fetch('/api/admin/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          minLength?: number;
        } | null;
        setError(
          body?.error === 'invalid_credentials'
            ? 'Current password is incorrect.'
            : body?.error === 'weak_password'
              ? `Password must be at least ${body.minLength ?? 12} characters.`
              : body?.error === 'validation'
                ? 'New passwords do not match.'
                : body?.error === 'rate_limited'
                  ? 'Too many attempts. Try again in a while.'
                  : 'Could not change the password. Try again.',
        );
        setStatus('error');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatus('saved');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('error');
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? (
        <p className={styles.formNote} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      {status === 'saved' ? (
        <p className={styles.formNote} data-tone="success">
          Password changed. Every other session has been signed out.
        </p>
      ) : null}
      <PasswordField
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
        required
      />
      <PasswordField
        label="New password"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
        hint="At least 12 characters."
        required
      />
      <PasswordField
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        required
      />
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Change password'}
        </button>
      </div>
    </form>
  );
}
