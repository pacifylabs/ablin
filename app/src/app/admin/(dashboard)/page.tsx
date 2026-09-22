import type { Metadata } from 'next';
import Link from 'next/link';
import { countSubmissions, getAvailability } from '@/cms/store';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Dashboard' };

const MODE_LABEL: Record<string, string> = {
  live: 'Live',
  coming_soon: 'Coming soon',
  under_construction: 'Under construction',
};

export default async function AdminDashboardPage() {
  const [{ total, unread }, availability] = await Promise.all([
    countSubmissions(),
    getAvailability(),
  ]);
  const mode = availability?.mode ?? 'live';

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <h1>Dashboard</h1>
      </header>

      <div className={styles.statGrid}>
        <div className={styles.stat}>
          <p className={styles.statValue}>{total}</p>
          <p className={styles.statLabel}>Submissions ({unread} unread)</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statValue}>
            <span className={styles.badge} data-tone={mode === 'live' ? 'live' : 'gated'}>
              {MODE_LABEL[mode] ?? mode}
            </span>
          </p>
          <p className={styles.statLabel}>Site availability</p>
        </div>
      </div>

      <p className={styles.panelTitle}>Quick links</p>
      <div className={styles.quickLinks}>
        <Link href="/admin/pages" className={styles.quickLink}>
          Edit pages
        </Link>
        <Link href="/admin/insights" className={styles.quickLink}>
          Manage Insights
        </Link>
        <Link href="/admin/submissions" className={styles.quickLink}>
          View submissions
        </Link>
        <Link href="/admin/settings" className={styles.quickLink}>
          Site settings
        </Link>
      </div>
    </div>
  );
}
