import type { Metadata } from 'next';
import { getAvailability } from '@/cms/store';
import { AvailabilityForm } from '@/admin/ui/AvailabilityForm';
import { ChangePasswordForm } from '@/admin/ui/ChangePasswordForm';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const availability = (await getAvailability()) ?? {
    mode: 'live' as const,
    message: '',
    updatedAt: '',
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <h1>Settings</h1>
      </header>

      <div className={styles.panel}>
        <p className={styles.panelTitle}>Site availability</p>
        <AvailabilityForm initial={availability} />
      </div>

      <div className={styles.panel}>
        <p className={styles.panelTitle}>Change password</p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
