import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { currentAdminId } from '@/admin/auth/session';
import { LoginForm } from '@/admin/ui/LoginForm';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false } };

export default async function AdminLoginPage() {
  if (await currentAdminId()) redirect('/admin');

  return (
    <div className={styles.authScreen}>
      <div className={styles.authCard}>
        <Logo priority className={styles.authLogo} />
        <h1 style={{ textAlign: 'center' }}>Admin sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
