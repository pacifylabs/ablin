import type { Metadata } from 'next';
import { LegalDocument } from '@/components/ui/LegalDocument';
import { getLegalPage } from '@/lib/content';

const SLUG = 'cookie-policy';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage(SLUG);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}` },
    // Unreviewed legal text stays out of search indexes until the client approves it (PRD §8.8).
    robots: page.reviewStatus === 'approved' ? undefined : { index: false, follow: true },
  };
}

export default async function Page() {
  return <LegalDocument page={await getLegalPage(SLUG)} />;
}
