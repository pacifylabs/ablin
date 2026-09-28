import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTopics } from '@/cms/collections/topics';
import { getPublicPage } from '@/cms/public-reads';
import { PageView } from '@/components/public/PageView';

type Params = Promise<{ topic: string }>;

async function resolveTopic(param: string) {
  const slug = decodeURIComponent(param);
  return (await getTopics()).find((t) => t.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return (await getTopics()).map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [topic, page] = await Promise.all([
    resolveTopic((await params).topic),
    getPublicPage('insights'),
  ]);
  if (!topic) return {};
  return {
    title: `${topic.name} — ${page.seoTitle}`,
    description: page.seoDescription,
    alternates: { canonical: `/insights/topic/${topic.slug}` },
  };
}

/** The Insights index filtered to one topic: the same page:insights blocks, with the topic in the render context. */
export default async function TopicPage({ params }: { params: Params }) {
  const topic = await resolveTopic((await params).topic);
  if (!topic) notFound();
  return <PageView slug="insights" ctx={{ topic: topic.slug }} />;
}
