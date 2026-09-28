import type { Metadata } from 'next';
import { PageView, pageMetadata } from '@/components/public/PageView';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('cookie-policy', '/cookie-policy');
}

export default function Page() {
  return <PageView slug="cookie-policy" />;
}
