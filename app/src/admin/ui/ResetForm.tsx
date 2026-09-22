'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import styles from './admin.module.css';

/**
 * Two modes in one component, switched on whether a `token` was in the URL: request a reset email, or (once the
 * emailed link is followed) set a new password. Requests always report the same success message regardless of
 * whether the email matched an account — src/admin/handlers/auth-handler.ts never reveals that either way.
 */
export function ResetForm({ token }: { token?: string }) {
  if (token) return <ConfirmStep token={token} />;
  return <RequestStep />;
}

function RequestStep() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.status === 429) {
        setError('Too many requests. Try again in a while.');
        return;
      }
      setSent(true);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className={styles.formNote} data-tone="success">
        If that email matches the admin account, a reset link is on its way. It expires in 30
        minutes.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <p className={styles.pageLead}>
        Enter the admin email and we&rsquo;ll send a link to reset the password.
      </p>
      {error ? (
        <p className={styles.formNote} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
        <Link href="/admin/login" className="link-quiet">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

function ConfirmStep({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      if (response.ok) {
        setDone(true);
        return;
      }
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        minLength?: number;
      } | null;
      if (body?.error === 'weak_password')
        setError(`Password must be at least ${body.minLength ?? 12} characters.`);
      else if (body?.error === 'validation') setError('Passwords do not match.');
      else if (body?.error === 'rate_limited') setError('Too many attempts. Try again in a while.');
      else setError('That reset link is invalid or has expired. Request a new one.');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className={styles.form}>
        <p className={styles.formNote} data-tone="success">
          Password updated. Every previous session has been signed out.
        </p>
        <Link href="/admin/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? (
        <p className={styles.formNote} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.field}>
        <label htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
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
        <label htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Set new password'}
        </button>
      </div>
    </form>
  );
}
