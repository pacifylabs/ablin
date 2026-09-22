import type { Metadata } from 'next';
import Link from 'next/link';
import { listAllArticles } from '@/cms/store';
import styles from '@/admin/ui/admin.module.css';

export const metadata: Metadata = { title: 'Insights' };

export default async function InsightsListPage() {
  const articles = (await listAllArticles()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>Insights</h1>
          <p className={styles.pageLead}>
            Articles published (or drafted) for the Insights section.
          </p>
        </div>
        <Link href="/admin/insights/new" className="btn btn-primary">
          New article
        </Link>
      </header>

      {articles.length === 0 ? (
        <p className="muted">No articles yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.slug}>
                <td>
                  <Link href={`/admin/insights/${article.slug}`}>{article.title}</Link>
                  <div className={styles.hint}>/insights/{article.slug}</div>
                </td>
                <td>
                  <span
                    className={styles.badge}
                    data-tone={
                      article.status === 'published'
                        ? article.draft
                          ? 'draft'
                          : 'published'
                        : 'draft'
                    }
                  >
                    {article.status === 'published'
                      ? article.draft
                        ? 'Published (edits pending)'
                        : 'Published'
                      : 'Draft'}
                  </span>
                </td>
                <td>{new Date(article.updatedAt).toLocaleString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
