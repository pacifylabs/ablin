import type { Metadata } from 'next';
import { PageView, pageMetadata } from '@/components/public/PageView';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('contact', '/contact');
}

export default function ContactPage() {
  return <PageView slug="contact" />;
}
