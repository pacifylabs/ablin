'use client';

import { useState, type FormEvent } from 'react';
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
      <div className={styles.field}>
        <label htmlFor="current-password">Current password</label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          className={styles.input}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={styles.input}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <p className={styles.hint}>At least 12 characters.</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          className={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Change password'}
        </button>
      </div>
    </form>
  );
}
