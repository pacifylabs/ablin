import type { Metadata } from 'next';
import { NewArticleForm } from '@/admin/ui/NewArticleForm';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'New article' };

export default function NewInsightPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>New article</h1>
          <p className={styles.pageLead}>
            Starts as a draft. Add blocks and publish when it&rsquo;s ready.
          </p>
        </div>
      </header>
      <NewArticleForm />
    </div>
  );
}
