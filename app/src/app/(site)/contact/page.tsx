import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/ContactForm';
import blocks from '@/components/ui/blocks.module.css';
import { getPageWithFallback } from '@/cms/store';
import { getContactPage } from '@/lib/content';

// Reads content from Redis (see cms/store.ts's getPageWithFallback), so this must render per-request,
// not once at build time: a save in the admin block editor needs to be live immediately, and the build
// must not depend on Redis being reachable.
export const dynamic = 'force-dynamic';

// Contact carries no blocks — the form, its aside and their copy are fixed (see admin/README.md §Pinned
// sections); only its SEO title/description are admin-editable, via page:contact.
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageWithFallback('contact');
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: '/contact' },
  };
}

export default async function ContactPage() {
  const page = await getContactPage();

  return (
    <>
      <section
        className="section section-surface"
        aria-labelledby="page-title"
        style={{ paddingBottom: 'var(--space-12)' }}
      >
        <div className="container" style={{ display: 'grid', gap: 'var(--space-5)' }}>
          <h1 id="page-title">{page.title}</h1>
          <p className="lead">{page.lead}</p>
        </div>
      </section>

      <section
        className="section section-surface"
        style={{ paddingTop: 0 }}
        aria-label="Contact form"
      >
        <div className={`container ${blocks.contactGrid}`}>
          <div className="card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            <ContactForm enquiryTypes={page.enquiryTypes} />
          </div>
          <aside className={blocks.contactAside} aria-label="About your enquiry">
            <div className="card">
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.75rem)' }}>{page.next.title}</h2>
              <ul className={blocks.contactSteps}>
                {page.next.steps.map((step) => (
                  <li key={step.title}>
                    <h3>{step.title}</h3>
                    <p className="muted">{step.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <p className="muted">{page.privacyNote}</p>
              <p className="card-foot">
                <Link href="/privacy-policy" className="link-quiet">
                  Read the Privacy Policy
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
