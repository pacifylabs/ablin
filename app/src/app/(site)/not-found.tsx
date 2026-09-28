import type { Metadata } from 'next';
import { getErrorSettings } from '@/cms/globals';
import { NotFoundContent } from '@/components/shell/NotFoundContent';

export async function generateMetadata(): Promise<Metadata> {
  const { notFound } = await getErrorSettings();
  return { title: notFound.title, robots: { index: false } };
}

/** Covers a notFound() thrown from a matched (site) page (e.g. an unbuilt service or article slug). */
export default async function NotFound() {
  const { notFound } = await getErrorSettings();
  return <NotFoundContent copy={notFound} />;
}
