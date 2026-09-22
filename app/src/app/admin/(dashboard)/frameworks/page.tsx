import type { Metadata } from 'next';
import { getFrameworksWithFallback } from '@/cms/store';
import { seedFrameworks } from '@/cms/seed-data';
import { FrameworksEditor } from '@/admin/ui/FrameworksEditor';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Frameworks' };

export default async function FrameworksPage() {
  const frameworks = await getFrameworksWithFallback();
  const seedById = Object.fromEntries(seedFrameworks.map((f) => [f.id, f]));

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Frameworks</h1>
          <p className={styles.pageLead}>
            What the footer strip shows, and what the framework-index block on any page can pick
            from. Turn one off to drop it everywhere; reorder to change the footer strip&rsquo;s
            order.
          </p>
        </div>
      </header>
      <FrameworksEditor initial={frameworks} seedById={seedById} />
    </div>
  );
}
