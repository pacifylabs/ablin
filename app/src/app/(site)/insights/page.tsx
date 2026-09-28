import type { Metadata } from 'next';
import { PageView, pageMetadata } from '@/components/public/PageView';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('insights', '/insights');
}

export default function InsightsPage() {
  return <PageView slug="insights" />;
}
