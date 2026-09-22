import Link from 'next/link';
import type { ArticleDoc } from '@/cms/schema';

/**
 * The one card the (previously unbuilt) published-article list uses, on both /insights and /insights/topic/*.
 * Built the same way ui/ServiceCard.tsx is — the global `.card`/`.card-foot` classes, no new CSS.
 */
export function ArticleCard({ article }: { article: ArticleDoc }) {
  return (
    <article className="card">
      <h3>{article.title}</h3>
      <p className="muted">{article.excerpt}</p>
      {article.topics.length > 0 ? (
        <p className="small muted">{article.topics.join(' · ')}</p>
      ) : null}
      <p className="card-foot">
        <Link href={`/insights/${article.slug}`} className="link-quiet">
          Read this article<span className="sr-only">: {article.title}</span>
        </Link>
      </p>
    </article>
  );
}
