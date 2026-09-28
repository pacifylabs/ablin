import type { Metadata } from 'next';
import { PageView, pageMetadata } from '@/components/public/PageView';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('who-we-serve', '/who-we-serve');
}

export default function Page() {
  return <PageView slug="who-we-serve" />;
}
