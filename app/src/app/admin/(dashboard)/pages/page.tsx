import type { Metadata } from 'next';
import Link from 'next/link';
import { PAGE_SLUGS } from '@/cms/schema';
import { getPageWithFallback } from '@/cms/store';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Pages' };

export default async function PagesListPage() {
  const pages = await Promise.all(PAGE_SLUGS.map((slug) => getPageWithFallback(slug)));

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Pages</h1>
          <p className={styles.pageLead}>
            The site&rsquo;s ten pages. Each one is edited as a set of blocks.
          </p>
        </div>
      </header>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Page</th>
            <th>Status</th>
            <th>Blocks</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.slug}>
              <td>
                <Link href={`/admin/pages/${page.slug}`}>{page.title}</Link>
                <div className={styles.hint}>/{page.slug === 'home' ? '' : page.slug}</div>
              </td>
              <td>
                <span className={styles.badge} data-tone={page.draft ? 'draft' : 'published'}>
                  {page.draft ? 'Unpublished edits' : 'Published'}
                </span>
              </td>
              <td>{page.blocks.length}</td>
              <td>{new Date(page.updatedAt).toLocaleString('en-GB')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
