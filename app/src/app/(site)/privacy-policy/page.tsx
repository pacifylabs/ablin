import type { Metadata } from 'next';
import { PageView, pageMetadata } from '@/components/public/PageView';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('privacy-policy', '/privacy-policy');
}

export default function Page() {
  return <PageView slug="privacy-policy" />;
}
