import type { Metadata } from 'next';
import { SEED_TOPICS, readTopics } from '@/cms/collections/topics';
import { TopicsEditor } from '@/admin/ui/TopicsEditor';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Topics' };

export default async function TopicsPage() {
  const topics = (await readTopics()) ?? [...SEED_TOPICS];
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Topics</h1>
          <p className={styles.pageLead}>
            The Insights topics shown as chips. Articles are filed under them by name.
          </p>
        </div>
      </header>
      <TopicsEditor initial={topics} />
    </div>
  );
}
