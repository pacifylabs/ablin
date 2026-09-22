import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle, listTopics } from '@/cms/store';
import { getAudiences, getFrameworks, getServices } from '@/lib/content';
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
  const [article, services, audiences, frameworks, topics] = await Promise.all([
    getArticle(slug),
    getServices(),
    getAudiences(),
    getFrameworks(),
    listTopics(),
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
      <ArticleEditor
        article={article}
        knownTopics={topics}
        refs={{
          services: services.map((s) => ({ slug: s.slug, title: s.title })),
          audiences: audiences.map((a) => ({ slug: a.slug, title: a.title })),
          frameworks: frameworks.map((f) => ({ id: f.id, name: f.name })),
        }}
      />
    </div>
  );
}
