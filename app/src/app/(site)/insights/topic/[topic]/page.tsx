import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTopics } from '@/cms/collections/topics';
import { getPublicPage } from '@/cms/public-reads';
import { PageView } from '@/components/public/PageView';
import { defaultShareImage } from '@/cms/site-meta';
import { buildPageMetadata } from '@/lib/seo';

type Params = Promise<{ topic: string }>;

async function resolveTopic(param: string) {
  const slug = decodeURIComponent(param);
  return (await getTopics()).find((t) => t.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return (await getTopics()).map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [topic, page, fallback] = await Promise.all([
    resolveTopic((await params).topic),
    getPublicPage('insights'),
    defaultShareImage(),
  ]);
  if (!topic) return {};
  return buildPageMetadata({
    title: `${topic.name} — ${page.seoTitle}`,
    description: page.seoDescription,
    path: `/insights/topic/${topic.slug}`,
    defaultImage: fallback,
  });
}

/** The Insights index filtered to one topic: the same page:insights blocks, with the topic in the render context. */
export default async function TopicPage({ params }: { params: Params }) {
  const topic = await resolveTopic((await params).topic);
  if (!topic) notFound();
  return <PageView slug="insights" ctx={{ topic: topic.slug }} />;
}
