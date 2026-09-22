import Link from 'next/link';
import styles from '@/admin/ui/admin.module.css';

export default function AdminNotFound() {
  return (
    <div className={styles.page}>
      <h1>Not found</h1>
      <p className={styles.pageLead}>
        That admin page or record doesn&rsquo;t exist.{' '}
        <Link href="/admin">Back to the dashboard</Link>.
      </p>
    </div>
  );
}
