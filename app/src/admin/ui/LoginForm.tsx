'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { PasswordField } from './fields/shared';
import styles from './admin.module.css';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(
          body?.error === 'rate_limited'
            ? 'Too many attempts. Try again in a few minutes.'
            : 'Incorrect email or password.',
        );
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? (
        <p className={styles.formNote} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={styles.input}
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
      />
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        <Link href="/admin/reset" className="link-quiet">
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
