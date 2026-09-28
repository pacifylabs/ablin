import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isGlobalName } from '@/cms/globals';
import { readGlobalForAdmin } from '@/admin/handlers/globals-handler';
import { GLOBAL_TITLES } from '@/admin/ui/settings/titles';
import { GlobalEditor } from '@/admin/ui/settings/GlobalEditor';
import styles from '@/admin/ui/admin.module.css';

type Params = Promise<{ name: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { name } = await params;
  return { title: isGlobalName(name) ? GLOBAL_TITLES[name].title : 'Settings' };
}

export default async function GlobalSettingsPage({ params }: { params: Params }) {
  const { name } = await params;
  if (!isGlobalName(name)) notFound();
  const { value, invalid } = await readGlobalForAdmin(name);
  const { title, lead } = GLOBAL_TITLES[name];
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>{title}</h1>
          <p className={styles.pageLead}>{lead}</p>
        </div>
      </header>
      <GlobalEditor name={name} initial={value} invalid={invalid} />
    </div>
  );
}
