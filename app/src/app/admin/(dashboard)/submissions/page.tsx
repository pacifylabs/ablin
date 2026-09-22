import type { Metadata } from 'next';
import { listSubmissions } from '@/cms/store';
import { SubmissionsTable } from '@/admin/ui/SubmissionsTable';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Submissions' };

export default async function SubmissionsPage() {
  const submissions = await listSubmissions();

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Submissions</h1>
          <p className={styles.pageLead}>Enquiries sent through the contact form.</p>
        </div>
      </header>
      <SubmissionsTable initial={submissions} />
    </div>
  );
}
