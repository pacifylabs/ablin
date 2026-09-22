import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAGE_SLUGS, type PageSlug } from '@/cms/schema';
import { getPageWithFallback } from '@/cms/store';
import { getAudiences, getFrameworks, getServices } from '@/lib/content';
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

  const [page, services, audiences, frameworks] = await Promise.all([
    getPageWithFallback(slug),
    getServices(),
    getAudiences(),
    getFrameworks(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>{page.title}</h1>
          <p className={styles.pageLead}>/{slug === 'home' ? '' : slug}</p>
        </div>
      </header>
      <PageEditor
        page={page}
        refs={{
          services: services.map((s) => ({ slug: s.slug, title: s.title })),
          audiences: audiences.map((a) => ({ slug: a.slug, title: a.title })),
          frameworks: frameworks.map((f) => ({ id: f.id, name: f.name })),
        }}
      />
    </div>
  );
}
