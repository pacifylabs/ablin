import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/cms/store';
import { loadBlockRefs } from '@/admin/refs';
import { readTopics, SEED_TOPICS } from '@/cms/collections/topics';
import { ArticleEditor } from '@/admin/ui/ArticleEditor';
import { DeleteArticleButton } from '@/admin/ui/DeleteArticleButton';
import styles from '@/admin/ui/admin.module.css';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  return { title: article?.title ?? 'Article' };
}

export default async function EditInsightPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [article, refs, topics] = await Promise.all([
    getArticle(slug),
    loadBlockRefs(),
    readTopics().then((t) => (t ?? SEED_TOPICS).map((x) => x.name)),
  ]);
  if (!article) notFound();

  return (
    <div className={styles.page}>
      <header className={styles.pageHead}>
        <div>
          <h1>{article.title}</h1>
          <p className={styles.pageLead}>/insights/{slug}</p>
        </div>
        <DeleteArticleButton slug={slug} />
      </header>
      <ArticleEditor article={article} knownTopics={topics} refs={refs} />
    </div>
  );
}
