import type { Metadata } from 'next';
import { organizationJsonLd } from '@/cms/site-meta';
import { PageView, pageMetadata } from '@/components/public/PageView';
import { jsonLdScriptContent } from '@/lib/json-ld';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata('home', '/', { absoluteTitle: true });
}

export default async function HomePage() {
  const jsonLd = await organizationJsonLd();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScriptContent(jsonLd) }}
      />
      <PageView slug="home" />
    </>
  );
}
