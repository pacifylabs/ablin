import type { Metadata } from 'next';
import { PageView, pageMetadata } from '@/components/public/PageView';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('terms-of-use', '/terms-of-use');
}

export default function Page() {
  return <PageView slug="terms-of-use" />;
}
