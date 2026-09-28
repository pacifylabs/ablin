import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readService } from '@/cms/collections/services';
import { loadBlockRefs } from '@/admin/refs';
import { ServiceEditor } from '@/admin/ui/ServiceEditor';
import styles from '@/admin/ui/admin.module.css';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await params).slug };
}

export default async function EditServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [service, refs] = await Promise.all([readService(slug).catch(() => null), loadBlockRefs()]);
  if (!service) notFound();
  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>{service.title}</h1>
          <p className={styles.pageLead}>/services/{slug}</p>
        </div>
      </header>
      <ServiceEditor initial={service} refs={refs} />
    </div>
  );
}
