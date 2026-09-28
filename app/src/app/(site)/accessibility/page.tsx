import type { Metadata } from 'next';
import { PageView, pageMetadata } from '@/components/public/PageView';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('accessibility', '/accessibility');
}

export default function Page() {
  return <PageView slug="accessibility" />;
}
