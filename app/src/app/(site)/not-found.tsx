import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/shell/NotFoundContent';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

/** Covers a notFound() thrown from a matched (site) page (e.g. an unbuilt service or article slug). */
export default function NotFound() {
  return <NotFoundContent />;
}
