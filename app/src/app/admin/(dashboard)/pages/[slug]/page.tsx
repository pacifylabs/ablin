import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAGE_SLUGS, type PageSlug } from '@/cms/schema';
import { getPage } from '@/cms/store';
import { seedPage } from '@/cms/seed-data';
import { loadBlockRefs } from '@/admin/refs';
import { PageEditor } from '@/admin/ui/PageEditor';
import styles from '@/admin/ui/admin.module.css';

type Params = Promise<{ slug: string }>;

function isPageSlug(slug: string): slug is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: isPageSlug(slug) ? slug : 'Page' };
}

export default async function EditPagePage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();

  // A stored page from an older layout (or none yet) opens as the bundled v3 page; saving replaces it.
  const [stored, refs] = await Promise.all([getPage(slug).catch(() => null), loadBlockRefs()]);
  const page = stored ?? seedPage(slug);

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>{page.title}</h1>
          <p className={styles.pageLead}>/{slug === 'home' ? '' : slug}</p>
        </div>
      </header>
      {stored ? null : (
        <p className={styles.formNote} data-tone="warning">
          This page has not been saved in the current layout yet. Publishing saves it.
        </p>
      )}
      <PageEditor page={page} refs={refs} />
    </div>
  );
}
