import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { ResetForm } from '@/admin/ui/ResetForm';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = {
  title: 'Reset admin password',
  robots: { index: false },
  // The reset link in the query string is a bearer token: never let it leak via a Referer header.
  referrer: 'no-referrer',
};

type SearchParams = Promise<{ token?: string }>;

export default async function AdminResetPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  return (
    <div className={styles.authScreen}>
      <div className={styles.authCard}>
        <Logo priority className={styles.authLogo} />
        <h1 style={{ textAlign: 'center' }}>{token ? 'Set a new password' : 'Reset password'}</h1>
        <ResetForm token={token} />
      </div>
    </div>
  );
}
