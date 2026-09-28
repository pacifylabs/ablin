import type { Metadata } from 'next';
import { SEED_FRAMEWORKS, readFrameworks } from '@/cms/collections/frameworks';
import { FrameworksEditor } from '@/admin/ui/FrameworksEditor';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Frameworks' };

export default async function FrameworksPage() {
  const frameworks = (await readFrameworks()) ?? SEED_FRAMEWORKS;

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Frameworks</h1>
          <p className={styles.pageLead}>
            The frameworks shown in the footer strip and in any framework strip on a page, in this
            order. A logo appears only when the client has approved it.
          </p>
        </div>
      </header>
      <FrameworksEditor initial={frameworks} />
    </div>
  );
}
