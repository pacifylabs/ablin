'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './admin.module.css';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      className={styles.iconBtn}
      onClick={logout}
      disabled={pending}
      style={{ width: 'auto', padding: '0 0.75rem' }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
